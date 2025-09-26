import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase, Swap } from '@/utils/db';

// Initialize database on first request
let isInitialized = false;

const ensureInitialized = async () => {
  if (!isInitialized) {
    await initDatabase();
    isInitialized = true;
  }
};

// POST /api/swaps - Log a new swap
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const {
      user_address,
      from_chain,
      to_chain,
      from_token,
      to_token,
      amount,
      tx_hash,
      timestamp
    } = body;

    // Validate required fields
    if (!user_address || !from_chain || !to_chain || !from_token || !to_token || !amount || !tx_hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert the swap record
    const result = await sql`
      INSERT INTO swaps (
        user_address, from_chain, to_chain, from_token, 
        to_token, amount, tx_hash, timestamp
      ) VALUES (
        ${user_address}, ${from_chain}, ${to_chain}, ${from_token},
        ${to_token}, ${amount}, ${tx_hash}, ${timestamp || new Date()}
      )
      RETURNING *
    `;

    return NextResponse.json(
      { 
        message: 'Swap logged successfully', 
        swap: result[0] 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error logging swap:', error);
    
    // Handle duplicate transaction hash
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Transaction already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/swaps - Get all swaps (for admin use)
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get all swaps with pagination
    const swaps = await sql`
      SELECT * FROM swaps 
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM swaps`;
    const total = parseInt(countResult[0].total);

    return NextResponse.json({
      swaps,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching swaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}