import { neon } from '@neondatabase/serverless';

// Get database URL from environment variables
const getDatabaseUrl = (): string => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return databaseUrl;
};

// Initialize database connection
export const sql = neon(getDatabaseUrl());

// Database initialization functions
export const initDatabase = async () => {
  try {
    // Create tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        chain VARCHAR(50) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        address VARCHAR(50) NOT NULL,
        decimals INTEGER NOT NULL DEFAULT 18,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chain, address)
      )
    `;

    // Create swaps table
    await sql`
      CREATE TABLE IF NOT EXISTS swaps (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(50) NOT NULL,
        from_chain VARCHAR(50) NOT NULL,
        to_chain VARCHAR(50) NOT NULL,
        from_token VARCHAR(50) NOT NULL,
        to_token VARCHAR(50) NOT NULL,
        amount VARCHAR(100) NOT NULL,
        tx_hash VARCHAR(100) NOT NULL UNIQUE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Types for database records
export interface Token {
  id?: number;
  chain: string;
  symbol: string;
  address: string;
  decimals: number;
  created_at?: Date;
}

export interface Swap {
  id?: number;
  user_address: string;
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  amount: string;
  tx_hash: string;
  timestamp?: Date;
  created_at?: Date;
}