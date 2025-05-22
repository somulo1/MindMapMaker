import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

let db: ReturnType<typeof drizzle> | null = null;

export async function getDrizzle() {
  if (db) return db;
  
  const sqlite = new Database(path.join(process.cwd(), 'data', 'chama.db'));
  db = drizzle(sqlite);
  return db;
}

// Initialize the database connection
getDrizzle().catch(err => console.error('Error initializing Drizzle:', err)); 