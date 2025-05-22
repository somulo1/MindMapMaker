-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    profile_pic TEXT,
    location TEXT,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    is_active INTEGER NOT NULL DEFAULT 1,
    last_active INTEGER,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chamas table
CREATE TABLE IF NOT EXISTS chamas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'groups',
    icon_bg TEXT DEFAULT 'primary',
    member_count INTEGER NOT NULL DEFAULT 1,
    balance REAL NOT NULL DEFAULT 0,
    established_date INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_meeting INTEGER,
    created_by INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Chama Members table
CREATE TABLE IF NOT EXISTS chama_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chama_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    contribution_amount REAL DEFAULT 0,
    contribution_frequency TEXT DEFAULT 'monthly',
    rating INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    joined_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chama_id) REFERENCES chamas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Wallets table with enhanced constraints
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    chama_id INTEGER,
    balance REAL NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency TEXT NOT NULL DEFAULT 'KES',
    last_updated INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chama_id) REFERENCES chamas(id),
    -- Ensure wallet belongs to either a user or a chama, but not both
    CHECK ((user_id IS NOT NULL AND chama_id IS NULL) OR (user_id IS NULL AND chama_id IS NOT NULL)),
    -- Ensure unique wallet per user/chama and currency
    UNIQUE(user_id, currency),
    UNIQUE(chama_id, currency)
);

-- Create indexes for wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_chama_id ON wallets(chama_id);

-- Transactions table with enhanced constraints
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    chama_id INTEGER,
    type TEXT NOT NULL CHECK (
        type IN ('deposit', 'withdrawal', 'transfer', 'contribution', 'refund', 'fee')
    ),
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT,
    source_wallet INTEGER,
    destination_wallet INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'failed', 'cancelled')
    ),
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chama_id) REFERENCES chamas(id),
    FOREIGN KEY (source_wallet) REFERENCES wallets(id),
    FOREIGN KEY (destination_wallet) REFERENCES wallets(id),
    -- Ensure at least one wallet is specified
    CHECK (source_wallet IS NOT NULL OR destination_wallet IS NOT NULL),
    -- Prevent same source and destination wallet
    CHECK (source_wallet != destination_wallet OR source_wallet IS NULL),
    -- Ensure transaction belongs to either a user or a chama
    CHECK ((user_id IS NOT NULL AND chama_id IS NULL) OR (user_id IS NULL AND chama_id IS NOT NULL))
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_chama_id ON transactions(chama_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source_wallet ON transactions(source_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_destination_wallet ON transactions(destination_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_transaction_update_source;
DROP TRIGGER IF EXISTS after_transaction_update_destination;
DROP TRIGGER IF EXISTS before_transaction_check_balance;
DROP TRIGGER IF EXISTS update_wallet_timestamp;
DROP TRIGGER IF EXISTS after_transaction_insert_source;
DROP TRIGGER IF EXISTS after_transaction_insert_destination;
DROP TRIGGER IF EXISTS before_transaction_insert_check_balance;

-- Create trigger to update source wallet balance on UPDATE
CREATE TRIGGER after_transaction_update_source
   AFTER UPDATE ON transactions
   WHEN NEW.status = 'completed' AND NEW.source_wallet IS NOT NULL 
        AND (OLD.status != 'completed' OR OLD.status IS NULL)
BEGIN
    UPDATE wallets 
    SET balance = balance - NEW.amount,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = NEW.source_wallet;
END;

-- Create trigger to update destination wallet balance on UPDATE
CREATE TRIGGER after_transaction_update_destination
   AFTER UPDATE ON transactions
   WHEN NEW.status = 'completed' AND NEW.destination_wallet IS NOT NULL 
        AND (OLD.status != 'completed' OR OLD.status IS NULL)
BEGIN
    UPDATE wallets 
    SET balance = balance + NEW.amount,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = NEW.destination_wallet;
END;

-- Create trigger to update source wallet balance on INSERT
CREATE TRIGGER after_transaction_insert_source
   AFTER INSERT ON transactions
   WHEN NEW.status = 'completed' AND NEW.source_wallet IS NOT NULL
BEGIN
    UPDATE wallets 
    SET balance = balance - NEW.amount,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = NEW.source_wallet;
END;

-- Create trigger to update destination wallet balance on INSERT
CREATE TRIGGER after_transaction_insert_destination
   AFTER INSERT ON transactions
   WHEN NEW.status = 'completed' AND NEW.destination_wallet IS NOT NULL
BEGIN
    UPDATE wallets 
    SET balance = balance + NEW.amount,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = NEW.destination_wallet;
END;

-- Create trigger to prevent negative balance on UPDATE
CREATE TRIGGER before_transaction_check_balance
   BEFORE UPDATE ON transactions
   WHEN NEW.status = 'completed' AND NEW.source_wallet IS NOT NULL
BEGIN
    SELECT CASE
        WHEN (SELECT balance FROM wallets WHERE id = NEW.source_wallet) < NEW.amount
        THEN RAISE(ABORT, 'Insufficient balance in source wallet')
    END;
END;

-- Create trigger to prevent negative balance on INSERT
CREATE TRIGGER before_transaction_insert_check_balance
   BEFORE INSERT ON transactions
   WHEN NEW.status = 'completed' AND NEW.source_wallet IS NOT NULL
BEGIN
    SELECT CASE
        WHEN (SELECT balance FROM wallets WHERE id = NEW.source_wallet) < NEW.amount
        THEN RAISE(ABORT, 'Insufficient balance in source wallet')
    END;
END;

-- Create trigger to update wallet timestamp
CREATE TRIGGER update_wallet_timestamp
   AFTER UPDATE OF balance ON wallets
BEGIN
    UPDATE wallets 
    SET last_updated = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
    related_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER,
    chama_id INTEGER,
    item_id INTEGER,
    content TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    is_system_message INTEGER NOT NULL DEFAULT 0,
    sent_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (chama_id) REFERENCES chamas(id)
);

-- Learning Resources table
CREATE TABLE IF NOT EXISTS learning_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Items table
CREATE TABLE IF NOT EXISTS marketplace_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    chama_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KES',
    image_url TEXT,
    category TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    condition TEXT DEFAULT 'new',
    location TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (chama_id) REFERENCES chamas(id)
);

-- MindMaps table
CREATE TABLE IF NOT EXISTS mind_maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    nodes TEXT NOT NULL DEFAULT '[]',
    edges TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create AI Conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  messages TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Wishlist Items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  added_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES marketplace_items(id)
);

-- Create Chama Invitations table
CREATE TABLE IF NOT EXISTS chama_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chama_id INTEGER NOT NULL,
  invited_user_id INTEGER NOT NULL,
  invited_by_user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at INTEGER,
  FOREIGN KEY (chama_id) REFERENCES chamas(id),
  FOREIGN KEY (invited_user_id) REFERENCES users(id),
  FOREIGN KEY (invited_by_user_id) REFERENCES users(id)
);

-- Create Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES marketplace_items(id) ON DELETE CASCADE
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (item_id) REFERENCES marketplace_items(id)
);

-- Create Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  chama_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (chama_id) REFERENCES chamas(id)
);

-- Create Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chama_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  scheduled_for INTEGER NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chama_id) REFERENCES chamas(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chama_members_chama_id ON chama_members(chama_id);
CREATE INDEX IF NOT EXISTS idx_chama_members_user_id ON chama_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_chama_id ON messages(chama_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_chama_id ON marketplace_items(chama_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_user_id ON mind_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_item_id ON wishlist_items(item_id);
CREATE INDEX IF NOT EXISTS idx_chama_invitations_chama_id ON chama_invitations(chama_id);
CREATE INDEX IF NOT EXISTS idx_chama_invitations_invited_user_id ON chama_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_item_id ON cart_items(item_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON order_items(item_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_chama_id ON contributions(chama_id);
CREATE INDEX IF NOT EXISTS idx_meetings_chama_id ON meetings(chama_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_for ON meetings(scheduled_for); 