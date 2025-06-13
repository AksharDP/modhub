# ModHub Database Schema & tRPC Setup

This document describes the database schema and tRPC setup for the ModHub application.

## Overview

The ModHub application uses:
- **Drizzle ORM** for database operations and migrations
- **LibSQL/SQLite** as the database (compatible with Turso for production)
- **tRPC** for type-safe API routes
- **Zod** for input validation

## Database Schema

### Core Tables

#### Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `profilePicture` - URL to profile image
- `bio` - User biography
- `createdAt`, `updatedAt` - Timestamps

#### Games
- `id` - Primary key
- `name` - Game name (unique)
- `slug` - URL-friendly identifier
- `description` - Game description
- `imageUrl` - Game cover image
- `isActive` - Whether the game is active
- `createdAt`, `updatedAt` - Timestamps

#### Categories
- `id` - Primary key
- `name` - Category name (unique)
- `slug` - URL-friendly identifier
- `description` - Category description
- `color` - Display color (hex)
- `createdAt` - Timestamp

#### Mods
- `id` - Primary key
- `title` - Mod title
- `slug` - URL-friendly identifier (unique)
- `description` - Mod description
- `version` - Mod version
- `imageUrl` - Main mod image
- `downloadUrl` - Direct download link
- `size` - File size
- `isActive` - Whether mod is published
- `isFeatured` - Whether mod is featured
- `authorId` - Foreign key to users
- `gameId` - Foreign key to games
- `categoryId` - Foreign key to categories
- `createdAt`, `updatedAt` - Timestamps

### Associated Tables

#### Mod Tags
- Many-to-many relationship for mod tags
- `modId` - Foreign key to mods
- `tag` - Tag string

#### Mod Images
- Additional screenshots/images for mods
- `modId` - Foreign key to mods
- `imageUrl` - Image URL
- `caption` - Image caption
- `order` - Display order

#### Mod Files
- Downloadable files for each mod
- `modId` - Foreign key to mods
- `fileName` - Original filename
- `fileUrl` - Download URL
- `fileSize` - File size
- `version` - File version
- `isMainFile` - Whether this is the primary file
- `downloadCount` - Number of downloads

#### Mod Stats
- Statistics for each mod (one-to-one with mods)
- `modId` - Foreign key to mods (unique)
- `totalDownloads` - Total download count
- `weeklyDownloads` - Downloads this week
- `monthlyDownloads` - Downloads this month
- `likes` - Number of likes
- `views` - View count
- `rating` - Average rating (0-5)
- `ratingCount` - Number of ratings

### User Interaction Tables

#### User Mod Likes
- Tracks which users liked which mods
- `userId` - Foreign key to users
- `modId` - Foreign key to mods

#### User Mod Ratings
- User ratings and reviews for mods
- `userId` - Foreign key to users
- `modId` - Foreign key to mods
- `rating` - Rating (1-5 stars)
- `review` - Optional text review

#### User Mod Downloads
- Download tracking (for analytics)
- `userId` - Foreign key to users (nullable for anonymous)
- `modId` - Foreign key to mods
- `fileId` - Foreign key to mod files
- `ipAddress` - User IP (for analytics)
- `userAgent` - Browser info

#### User Follows
- User following system
- `followerId` - User doing the following
- `followingId` - User being followed

## tRPC API Structure

### Available Procedures

#### `mod.getMods`
- **Input**: Pagination, filtering, and sorting options
- **Output**: Paginated list of mods with author, game, category, and stats
- **Filters**: Game, category, search term
- **Sorting**: Downloads, rating, creation date, update date, likes

#### `mod.getModById`
- **Input**: Mod ID
- **Output**: Complete mod details including tags, images, and files

#### `mod.getModBySlug`
- **Input**: Mod slug
- **Output**: Complete mod details

#### `mod.getFeaturedMods`
- **Input**: Limit (default 4)
- **Output**: Featured mods list

#### `mod.getModsByAuthor`
- **Input**: Author ID, pagination
- **Output**: Mods created by specific author

#### `mod.createMod`
- **Input**: Mod data with validation
- **Output**: Created mod
- **Note**: Creates mod, mod stats, and mod tags in transaction

#### `game.getPublicGames`
- **Input**: None
- **Output**: List of active games, each with `id`, `name`, `slug`, `description`, `imageUrl`, and `modCount`.
- **Sorting**: Game name (ascending)

## Setup Instructions

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Generate and Run Migrations
```bash
# Generate migration files
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Seed database with initial data
bun run db:setup
```

### 4. Development
```bash
# Start development server
bun run dev

# View database in Drizzle Studio
bun run db:studio
```

## Production Setup

For production with Turso:

1. Create a Turso database
2. Update environment variables:
   ```env
   DATABASE_URL="libsql://your-database.turso.io"
   DATABASE_AUTH_TOKEN="your-auth-token"
   ```
3. Run migrations in production environment

## Usage Examples

### Using tRPC in Components

```tsx
'use client';
import { trpc } from '../lib/trpc';

export function ModList() {
  const { data, isLoading } = trpc.mod.getMods.useQuery({
    limit: 10,
    sortBy: 'downloads',
    sortOrder: 'desc'
  });

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.mods.map(mod => (
        <div key={mod.id}>{mod.title}</div>
      ))}
    </div>
  );
}
```

### Creating a Mod

```tsx
const createMod = trpc.mod.createMod.useMutation();

const handleSubmit = async (data) => {
  try {
    const newMod = await createMod.mutateAsync({
      title: data.title,
      description: data.description,
      authorId: 1,
      gameId: 1,
      categoryId: 1,
      tags: ['gameplay', 'enhancement']
    });
    console.log('Created mod:', newMod);
  } catch (error) {
    console.error('Failed to create mod:', error);
  }
};
```

## File Structure

```
app/
  db/
    schema.ts          # Database schema definitions
    index.ts           # Database connection
    migrations/        # Generated migration files
  server/
    trpc.ts           # tRPC initialization
    routers/
      index.ts        # Main router
      mod.ts          # Mod-related procedures
  lib/
    trpc.ts           # Client-side tRPC setup
  components/
    TRPCProvider.tsx  # React Query + tRPC provider
drizzle.config.ts     # Drizzle configuration
scripts/
  setup-db.ts         # Database setup and seeding
```

This setup provides a robust, type-safe foundation for your ModHub application with full database schema, migrations, and API layer.
