import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function initializeDB() {
  if (db) return db;

  // Open SQLite database in the data directory
  db = await open({
    filename: path.join(process.cwd(), 'data', 'chama.db'),
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  console.log('Connected to SQLite database');
  return db;
}

// Initialize the database connection
initializeDB().catch(err => console.error('Error connecting to SQLite:', err));

// Export the database instance getter
export function getDB(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
} 