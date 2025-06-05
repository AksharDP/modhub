#!/usr/bin/env bun

/**
 * Quick database setup utility for local development
 * This script will help you set up either PostgreSQL or SQLite for testing
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

console.log('🚀 ModHub Database Setup Helper\n');

// Check if .env exists
if (!existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  try {
    execSync('cp .env.example .env', { stdio: 'inherit' });
    console.log('✅ .env file created!\n');
  } catch (error) {
    console.log('❌ Failed to create .env file. Please copy .env.example to .env manually. \n ' + error);
  }
}

console.log('📋 Database Setup Options:\n');
console.log('1. 🐘 PostgreSQL (Recommended for production)');
console.log('   - Install PostgreSQL server');
console.log('   - Create a database named "modhub"');
console.log('   - Update DATABASE_URI in .env');
console.log('   - Run: bun run db:setup\n');

console.log('2. 🔧 Local Development Quick Start');
console.log('   - Use Docker PostgreSQL for quick setup');
console.log('   - Run: docker run --name modhub-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=modhub -p 5432:5432 -d postgres:15');
console.log('   - Update .env: DATABASE_URI=postgresql://postgres:password@localhost:5432/modhub');
console.log('   - Run: bun run db:setup\n');

console.log('3. 🌐 Cloud Database (Supabase, Neon, etc.)');
console.log('   - Create a PostgreSQL database on your preferred cloud provider');
console.log('   - Copy the connection string to DATABASE_URI in .env');
console.log('   - Run: bun run db:setup\n');

console.log('📖 Current .env configuration:');
try {
  if (existsSync('.env')) {
    const envContent = readFileSync('.env', 'utf8');
    console.log(envContent);
  } else {
    console.log('❌ .env file not found');
  }
} catch (err) {
  console.log('❌ Could not read .env file ' + err);
}

console.log('\n🔍 Next steps:');
console.log('1. Choose one of the options above');
console.log('2. Update your .env file with the correct DATABASE_URI');
console.log('3. Run: bun run db:setup');
console.log('4. Run: bun run dev');
