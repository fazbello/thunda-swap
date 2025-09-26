import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/utils/db';

// Initialize database on first request
let isInitialized = false;

const ensureInitialized = async () => {
  if (!isInitialized) {
    await initDatabase();
    isInitialized = true;
  }
};

// GET /api/swaps/[address] - Get swaps for a specific user address
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    await ensureInitialized();
    
    const { address } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate address format (basic check)
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Get swaps for the specific user with pagination
    const swaps = await sql`
      SELECT * FROM swaps 
      WHERE LOWER(user_address) = LOWER(${address})
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    // Get total count for this user
    const countResult = await sql`
      SELECT COUNT(*) as total FROM swaps 
      WHERE LOWER(user_address) = LOWER(${address})
    `;
    const total = parseInt(countResult[0].total);

    return NextResponse.json({
      address,
      swaps,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching user swaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}