#!/usr/bin/env bun

/**
 * Add sample mods to the database for demonstration purposes
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../app/db/schema';

async function addSampleMods() {
  console.log('🎮 Adding sample mods to the database...');

  const client = postgres(process.env.DATABASE_URI!);
  const db = drizzle(client, { schema });

  try {
    const { mods, modStats } = schema;

    // Sample mods data
    const sampleMods = [
      {
        title: "Enhanced Graphics Pack",
        slug: "enhanced-graphics-pack",
        description: "Stunning visual improvements with high-resolution textures and enhanced lighting effects.",
        longDescription: "This comprehensive graphics pack transforms the game's visual experience with carefully crafted high-resolution textures, improved lighting systems, and enhanced particle effects. Compatible with all major game versions.",
        version: "2.1.0",
        imageUrl: "https://placehold.co/800x600/3B82F6/FFFFFF/png?text=Graphics+Pack",
        downloadUrl: "https://example.com/downloads/graphics-pack.zip",
        size: "245 MB",
        authorId: 1,
        gameId: 1,
        categoryId: 2, // Graphics category
        isFeatured: true,
      },
      {
        title: "Gameplay Overhaul",
        slug: "gameplay-overhaul",
        description: "Complete gameplay rebalancing with new mechanics and improved AI systems.",
        longDescription: "A comprehensive overhaul that rebalances game mechanics, introduces new gameplay elements, and significantly improves AI behavior. This mod has been years in development and represents the ultimate gameplay experience.",
        version: "1.5.3",
        imageUrl: "https://placehold.co/800x600/10B981/FFFFFF/png?text=Gameplay+Mod",
        downloadUrl: "https://example.com/downloads/gameplay-overhaul.zip",
        size: "156 MB",
        authorId: 2,
        gameId: 2,
        categoryId: 1, // Gameplay category
        isFeatured: true,
      },
      {
        title: "Immersive Audio Enhancement",
        slug: "immersive-audio-enhancement",
        description: "3D spatial audio and high-quality sound effects for complete immersion.",
        longDescription: "Experience the game like never before with this audio enhancement pack featuring 3D spatial audio, professionally remastered sound effects, and an adaptive music system that responds to gameplay events.",
        version: "1.2.1",
        imageUrl: "https://placehold.co/800x600/8B5CF6/FFFFFF/png?text=Audio+Pack",
        downloadUrl: "https://example.com/downloads/audio-enhancement.zip",
        size: "89 MB",
        authorId: 3,
        gameId: 3,
        categoryId: 3, // Audio category
        isFeatured: false,
      },
      {
        title: "Modern UI Redesign",
        slug: "modern-ui-redesign",
        description: "Clean, modern user interface with improved accessibility and customization options.",
        longDescription: "A complete UI overhaul featuring a modern, clean design with improved accessibility features, customizable layouts, and enhanced user experience. Fully compatible with controller and keyboard inputs.",
        version: "3.0.0",
        imageUrl: "https://placehold.co/800x600/F59E0B/FFFFFF/png?text=UI+Mod",
        downloadUrl: "https://example.com/downloads/ui-redesign.zip",
        size: "23 MB",
        authorId: 1,
        gameId: 1,
        categoryId: 4, // UI/UX category
        isFeatured: true,
      },
      {
        title: "Debug Tools Suite",
        slug: "debug-tools-suite",
        description: "Comprehensive debugging and development tools for modders and power users.",
        longDescription: "Essential tools for modders and advanced users including real-time debugging, performance monitoring, asset inspection, and code injection capabilities. Perfect for mod development and troubleshooting.",
        version: "1.0.7",
        imageUrl: "https://placehold.co/800x600/EF4444/FFFFFF/png?text=Debug+Tools",
        downloadUrl: "https://example.com/downloads/debug-tools.zip",
        size: "12 MB",
        authorId: 2,
        gameId: 2,
        categoryId: 5, // Tools category
        isFeatured: false,
      },
      {
        title: "Expansion Content Pack",
        slug: "expansion-content-pack",
        description: "New areas, quests, characters, and storylines to extend your adventure.",
        longDescription: "Massive content expansion featuring new explorable areas, engaging storylines, memorable characters, challenging quests, and hundreds of hours of additional gameplay content.",
        version: "2.3.0",
        imageUrl: "https://placehold.co/800x600/06B6D4/FFFFFF/png?text=Content+Pack",
        downloadUrl: "https://example.com/downloads/content-pack.zip",
        size: "1.2 GB",
        authorId: 3,
        gameId: 3,
        categoryId: 6, // Content category
        isFeatured: true,
      },
    ];

    // Insert mods
    for (const mod of sampleMods) {
      const [insertedMod] = await db.insert(mods).values(mod).onConflictDoNothing().returning({ id: mods.id });
      
      if (insertedMod) {
        // Create corresponding stats
        await db.insert(modStats).values({
          modId: insertedMod.id,
          totalDownloads: Math.floor(Math.random() * 10000) + 500,
          weeklyDownloads: Math.floor(Math.random() * 500) + 50,
          monthlyDownloads: Math.floor(Math.random() * 2000) + 200,
          likes: Math.floor(Math.random() * 1000) + 100,
          views: Math.floor(Math.random() * 50000) + 1000,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
          ratingCount: Math.floor(Math.random() * 500) + 50,
        }).onConflictDoNothing();
      }
    }

    console.log('✅ Sample mods added successfully!');
    console.log('🎯 Featured mods created for homepage');
    console.log('📊 Stats generated for all mods');

  } catch (error) {
    console.error('❌ Failed to add sample mods:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// For Bun runtime
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('add-sample-mods.ts')) {
  addSampleMods();
}
