import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Ensure environment variables are loaded (for Bun, .env is loaded automatically if present)
const databaseUrl = process.env.DATABASE_URI;

if (!databaseUrl) {
  console.error('❌ DATABASE_URI environment variable is not set.');
  console.log('📝 Please set up your database connection:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Update DATABASE_URI with your PostgreSQL connection string');
  console.log('3. Run: bun run db:setup');
  throw new Error('DATABASE_URI environment variable is not set. Please check your .env file.');
}

// Validate that it's a PostgreSQL URL
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('❌ DATABASE_URI must be a PostgreSQL connection string');
  console.log('✅ Example: postgresql://username:password@localhost:5432/modhub');
  throw new Error('Invalid DATABASE_URI: must be a PostgreSQL connection string');
}

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

try {
  // Database configuration for PostgreSQL
  client = postgres(databaseUrl, {
    // Connection settings for development
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  // Create the drizzle instance
  db = drizzle(client, { schema });

  console.log('✅ Database connection initialized');
} catch (error) {
  console.error('❌ Failed to initialize database connection:', error);
  throw error;
}

// Export the database connection
export { db, client };

// Type for the database instance
export type Database = typeof db;
