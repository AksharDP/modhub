#!/usr/bin/env bun

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../app/db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

async function main() {
  console.log('🚀 Starting database setup...');

  const client = postgres(process.env.DATABASE_URI!);
  const db = drizzle(client, { schema });

  try {
    console.log('📦 Running migrations...');
    await migrate(db, { migrationsFolder: './app/db/migrations' });
    console.log('✅ Migrations completed successfully!');

    console.log('🌱 Seeding database with initial data...');
    await seedDatabase(db);
    console.log('✅ Database seeded successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function seedDatabase(db: PostgresJsDatabase<typeof schema>) {
  const { users, games, categories } = schema;

  // Insert default categories
  const defaultCategories = [
    { name: 'Gameplay', slug: 'gameplay', description: 'Mods that change core gameplay mechanics', color: '#10B981' },
    { name: 'Graphics', slug: 'graphics', description: 'Visual enhancements and texture packs', color: '#3B82F6' },
    { name: 'Audio', slug: 'audio', description: 'Sound effects and music modifications', color: '#8B5CF6' },
    { name: 'UI/UX', slug: 'ui-ux', description: 'User interface improvements', color: '#F59E0B' },
    { name: 'Tools', slug: 'tools', description: 'Utility mods and developer tools', color: '#EF4444' },
    { name: 'Content', slug: 'content', description: 'New content additions', color: '#06B6D4' },
  ];

  for (const category of defaultCategories) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  // Insert default games
  const defaultGames = [
    { 
      name: 'Featured Game', 
      slug: 'featuredgame', 
      description: 'A popular game with lots of mods',
      imageUrl: 'https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Featured+Game'
    },
    { 
      name: 'Minecraft', 
      slug: 'minecraft', 
      description: 'The popular sandbox game',
      imageUrl: 'https://placehold.co/300x200/00AA00/FFFFFF/png?text=Minecraft'
    },
    { 
      name: 'Skyrim', 
      slug: 'skyrim', 
      description: 'The Elder Scrolls V: Skyrim',
      imageUrl: 'https://placehold.co/300x200/FFD700/000000/png?text=Skyrim'
    },
  ];

  for (const game of defaultGames) {
    await db.insert(games).values(game).onConflictDoNothing();
  }

  // Insert default users
  const defaultUsers = [
    {
      username: 'Modder123',
      email: 'modder123@example.com',
      profilePicture: 'https://placehold.co/100x100/FF6B6B/FFFFFF/png?text=M1',
      bio: 'Passionate mod creator with years of experience'
    },
    {
      username: 'VisualMaster',
      email: 'visual@example.com',
      profilePicture: 'https://placehold.co/100x100/4ECDC4/FFFFFF/png?text=VM',
      bio: 'Specializing in graphics and visual enhancements'
    },
    {
      username: 'AudioWizard',
      email: 'audio@example.com',
      profilePicture: 'https://placehold.co/100x100/45B7D1/FFFFFF/png?text=AW',
      bio: 'Creating immersive audio experiences'
    },
  ];

  for (const user of defaultUsers) {
    await db.insert(users).values(user).onConflictDoNothing();
  }

  console.log('✅ Initial data seeded successfully!');
}

// For Bun runtime
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('setup-db.ts')) {
  main();
}
