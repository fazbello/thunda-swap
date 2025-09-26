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

// GET /api/swaps/all - Get all swaps with enhanced filtering and stats (admin endpoint)
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const from_chain = searchParams.get('from_chain');
    const to_chain = searchParams.get('to_chain');
    const user_address = searchParams.get('user_address');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    // Build dynamic query with filters
    let whereConditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (from_chain) {
      whereConditions.push(`from_chain = $${paramIndex}`);
      queryParams.push(from_chain);
      paramIndex++;
    }

    if (to_chain) {
      whereConditions.push(`to_chain = $${paramIndex}`);
      queryParams.push(to_chain);
      paramIndex++;
    }

    if (user_address) {
      whereConditions.push(`LOWER(user_address) = LOWER($${paramIndex})`);
      queryParams.push(user_address);
      paramIndex++;
    }

    if (from_date) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      queryParams.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      queryParams.push(to_date);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get filtered swaps with pagination
  //  const swaps = await sql`
  //    SELECT * FROM swaps 
  //    ${whereClause ? sql.raw(whereClause) : sql``}
  //    ORDER BY created_at DESC 
  //    LIMIT ${limit} 
    //  OFFSET ${offset}
  //  `;

    // Get total count with same filters
//    const countResult = await sql`
  //    SELECT COUNT(*) as total FROM swaps 
  //    ${whereClause ? sql.raw(whereClause) : sql``}
 //   `;
 //   const total = parseInt(countResult[0].total);

    // Get additional stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_swaps,
        COUNT(DISTINCT user_address) as unique_users,
        COUNT(DISTINCT from_chain) as unique_from_chains,
        COUNT(DISTINCT to_chain) as unique_to_chains,
        MIN(created_at) as first_swap_date,
        MAX(created_at) as latest_swap_date
      FROM swaps
      ${whereClause ? sql.raw(whereClause) : sql``}
    `;

    // Get top chains by volume
    const topChains = await sql`
      SELECT 
        from_chain as chain,
        COUNT(*) as swap_count
      FROM swaps
      ${whereClause ? sql.raw(whereClause) : sql``}
      GROUP BY from_chain
      ORDER BY swap_count DESC
      LIMIT 10
    `;

    return NextResponse.json({
      swaps,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: stats[0],
      topChains,
      filters: {
        from_chain,
        to_chain,
        user_address,
        from_date,
        to_date
      }
    });
  } catch (error) {
    console.error('Error fetching all swaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
