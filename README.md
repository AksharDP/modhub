# ModHub - Mod Management Platform

This is a [Next.js](https://nextjs.org) project for managing and distributing game modifications.

## Getting Started

### Prerequisites

- Bun runtime installed
- PostgreSQL database server

### Environment Setup

1. Set the environment variable `DATABASE_URL`. ex. `postgres://user:password@localhost:3306/mydatabase`


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