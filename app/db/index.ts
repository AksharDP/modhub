import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database connection management with connection pooling
 *
 * Note: In Next.js, you may see multiple "Database connection pool initialized" messages.
 * This is normal behavior because Next.js creates separate bundles for:
 * - SSR (Server-Side Rendering)
 * - API Routes
 * - Edge Runtime (if used)
 *
 * Each bundle initializes its own connection pool, but they all share the same
 * underlying PostgreSQL connection pool, so no connection leaks occur.
 */

const globalForDb = globalThis as unknown as {
    client: postgres.Sql | undefined;
    db: ReturnType<typeof drizzle> | undefined;
    initialized: boolean;
};

function initializeDatabase() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ DATABASE_URL environment variable is not set.");
        console.log("📝 Please set up your database connection:");
        console.log("1. Copy .env.example to .env");
        console.log(
            "2. Update DATABASE_URL with your PostgreSQL connection string"
        );
        console.log("3. Run: bun run db:setup");
        throw new Error(
            "DATABASE_URL environment variable is not set. Please check environment variable."
        );
    }

    if (
        !databaseUrl.startsWith("postgresql://") &&
        !databaseUrl.startsWith("postgres://")
    ) {
        console.error("❌ DATABASE_URL must be a PostgreSQL connection string");
        console.log(
            "✅ Example: postgresql://username:password@localhost:5432/modhub"
        );
        throw new Error(
            "Invalid DATABASE_URL: must be a PostgreSQL connection string"
        );
    }

    if (globalForDb.client && globalForDb.db) {
        return { client: globalForDb.client, db: globalForDb.db };
    }

    try {
        const client = postgres(databaseUrl, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 10,
        });

        const db = drizzle(client, { schema });

        globalForDb.client = client;
        globalForDb.db = db;
        globalForDb.initialized = true;
        
        const environment =
            typeof window !== "undefined"
                ? "client"
                : process.env.NEXT_RUNTIME === "edge"
                ? "edge"
                : "server";

        if (process.env.NODE_ENV === "development") {
            console.log(
                `✅ Database connection pool initialized (${environment} bundle)`
            );
        }

        return { client, db };
    } catch (error) {
        console.error("❌ Failed to initialize database connection:", error);
        throw error;
    }
}

// Lazy initialization - only initialize when accessed
let _db: ReturnType<typeof drizzle> | undefined;
let _client: postgres.Sql | undefined;

const db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(target, prop, receiver) {
        if (!_db || !_client) {
            const initialized = initializeDatabase();
            _db = initialized.db;
            _client = initialized.client;
        }
        return Reflect.get(_db, prop, receiver);
    }
});

const client = new Proxy({} as postgres.Sql, {
    get(target, prop, receiver) {
        if (!_db || !_client) {
            const initialized = initializeDatabase();
            _db = initialized.db;
            _client = initialized.client;
        }
        return Reflect.get(_client, prop, receiver);
    }
});

export { db, client };

export type Database = typeof db;
