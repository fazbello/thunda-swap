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

// Helper for dynamic WHERE building
function buildWhere(whereConditions: string[]) {
  if (whereConditions.length === 0) return '';
  return 'WHERE ' + whereConditions.join(' AND ');
}

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
    let whereConditions: string[] = [];
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

    const whereClause = buildWhere(whereConditions);

    // 1. Get filtered swaps with pagination
    const swapsQuery = `
      SELECT * FROM swaps
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;
    const swaps = await sql(swapsQuery, [...queryParams, limit, offset]);

    // 2. Get total count with same filters
    const countQuery = `
      SELECT COUNT(*) as total FROM swaps
      ${whereClause}
    `;
    const countResult = await sql(countQuery, queryParams);
    const total = parseInt(countResult[0]?.total || '0');

    // 3. Get additional stats
    const statsQuery = `
      SELECT
        COUNT(*) as total_swaps,
        COUNT(DISTINCT user_address) as unique_users,
        COUNT(DISTINCT from_chain) as unique_from_chains,
        COUNT(DISTINCT to_chain) as unique_to_chains,
        MIN(created_at) as first_swap_date,
        MAX(created_at) as latest_swap_date
      FROM swaps
      ${whereClause}
    `;
    const stats = await sql(statsQuery, queryParams);

    // 4. Get top chains by volume
    const topChainsQuery = `
      SELECT
        from_chain as chain,
        COUNT(*) as swap_count
      FROM swaps
      ${whereClause}
      GROUP BY from_chain
      ORDER BY swap_count DESC
      LIMIT 10
    `;
    const topChains = await sql(topChainsQuery, queryParams);

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
