import type { Config } from 'drizzle-kit';

export default {
  schema: './app/db/schema.ts',
  out: './private/migrations', // updated to match actual migration folder
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
