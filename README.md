# ModHub - Mod Management Platform

This is a [Next.js](https://nextjs.org) project for managing and distributing game modifications.

## Getting Started

### Prerequisites

- Bun runtime installed
- PostgreSQL database server

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your PostgreSQL connection string:
```bash
DATABASE_URI=postgresql://username:password@localhost:5432/modhub
```

### Installation and Development

1. Install dependencies:
```bash
bun install
```

2. Run database migrations:
```bash
bun run db:migrate
```

3. Start the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

This project uses PostgreSQL with Drizzle ORM. Key commands:

- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:migrate` - Apply migrations to database
- `bun run db:studio` - Open Drizzle Studio for database management

## Admin Panel

The application includes a comprehensive admin panel for managing users and mods:

### Features:
- **User Management**: View, edit roles, and manage user accounts
- **Mod Management**: Control mod status, featured status, and moderation
- **Dashboard Statistics**: Overview of platform metrics and health
- **Role-Based Access Control**: Three user roles (admin, supporter, user)

### Admin Scripts:
```bash
# List all users and their roles
bun run admin:list

# Promote a user to admin role
bun run admin:make <username>
```

### Access:
- Only users with "admin" role can access the admin panel at `/admin`
- Admin link appears in navigation for admin users
- Comprehensive security and validation throughout

For detailed admin documentation, see [ADMIN.md](./ADMIN.md)

## Recent Changes

### Fixed Issues:
- ✅ Updated database configuration from SQLite to PostgreSQL
- ✅ Fixed Next.js 13+ viewport configuration
- ✅ Removed deprecated Turbopack experimental config
- ✅ Cleaned up unused files and components
- ✅ Fixed TypeScript errors in mod data handling
- ✅ Updated dependencies (removed @libsql/client, added postgres)
- ✅ Application now builds and runs successfully

### Architecture:
- Frontend: Next.js 15 with React 19
- Backend: tRPC for type-safe API
- Database: PostgreSQL with Drizzle ORM
- Styling: Tailwind CSS
- Package Manager: Bun

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
