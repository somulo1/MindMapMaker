import { db, testConnection } from './db';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { log } from './vite';

/**
 * Initialize the database by creating all tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    log('Testing database connection...');
    
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      log('Database connection failed. Please check your DATABASE_URL environment variable.');
      return false;
    }
    
    log('Database connection successful. Initializing database...');
    
    // Create tables for all schema entities
    // This uses SQL queries to create tables if they don't exist
    await db.execute(sql`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        profile_pic TEXT,
        location TEXT,
        phone_number TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Chamas table
      CREATE TABLE IF NOT EXISTS chamas (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'groups',
        icon_bg TEXT DEFAULT 'primary',
        member_count INTEGER NOT NULL DEFAULT 1,
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        established_date TIMESTAMP NOT NULL DEFAULT NOW(),
        next_meeting TIMESTAMP,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Chama members table
      CREATE TABLE IF NOT EXISTS chama_members (
        id SERIAL PRIMARY KEY,
        chama_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        contribution_amount DOUBLE PRECISION DEFAULT 0,
        contribution_frequency TEXT DEFAULT 'monthly',
        rating INTEGER DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Wallets table
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        chama_id INTEGER,
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'KES',
        last_updated TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        chama_id INTEGER,
        type TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        description TEXT,
        source_wallet INTEGER,
        destination_wallet INTEGER,
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        related_id INTEGER
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER,
        chama_id INTEGER,
        item_id INTEGER,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Learning resources table
      CREATE TABLE IF NOT EXISTS learning_resources (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        image_url TEXT,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Marketplace items table
      CREATE TABLE IF NOT EXISTS marketplace_items (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL,
        chama_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        price DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL DEFAULT 'KES',
        image_url TEXT,
        category TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        condition TEXT DEFAULT 'new',
        location TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Wishlist items table
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Cart items table
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        total_amount DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL DEFAULT 'KES',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- AI Assistant conversations table
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        messages JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Mind maps table
      CREATE TABLE IF NOT EXISTS mind_maps (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL,
        nodes JSONB NOT NULL DEFAULT '[]',
        edges JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    log('Database initialization completed successfully');
    return true;
  } catch (error) {
    log(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}