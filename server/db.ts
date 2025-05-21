import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables before checking DATABASE_URL
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
}).on('error', (err) => {
  console.error('Unexpected database connection error:', err);
  process.exit(-1);
});

export const db = drizzle(pool);

/**
 * Test the database connection
 * @returns Promise<boolean> true if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!pool) throw new Error('Connection pool not initialized');
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection verified at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}