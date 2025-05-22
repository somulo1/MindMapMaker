import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDB } from './index';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Initialize database connection
    const db = await initializeDB();

    // Read schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Execute the entire schema as a single transaction
    await db.exec('BEGIN TRANSACTION;');
    try {
      await db.exec(schema);
      await db.exec('COMMIT;');
      console.log('Database initialized successfully');
    } catch (error) {
      await db.exec('ROLLBACK;');
      throw error;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase }; 