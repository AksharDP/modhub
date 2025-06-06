# Admin Panel Documentation

## Overview

The admin panel provides a comprehensive interface for managing users, mods, and viewing platform statistics. It's only accessible to users with the "admin" role.

## Features

### 1. Dashboard Overview
- **Statistics Overview**: View key metrics including total users, mods, downloads, and platform health
- **Quick Actions**: Direct access to common admin tasks
- **Analytics**: Active mod ratio, featured mod ratio, and average downloads per mod

### 2. User Management
- **User List**: Paginated view of all users with search and role filtering
- **Role Management**: Change user roles between "user", "supporter", and "admin"
- **User Actions**: Delete users (with safety checks)
- **Safety Features**: 
  - Cannot delete yourself
  - Cannot remove the last admin
  - Cannot demote yourself if you're the only admin

### 3. Mod Management
- **Mod List**: Paginated view of all mods with filtering by status and featured state
- **Status Control**: Toggle mod active/inactive status
- **Featured Control**: Mark mods as featured (only available for active mods)
- **Mod Actions**: Delete mods
- **Search**: Find mods by title or description

## Access Control

### Role Hierarchy
1. **Admin**: Full access to admin panel, can manage users and mods
2. **Supporter**: Regular user with potential future privileges
3. **User**: Regular user with standard access

### Admin Panel Access
- Only users with "admin" role can access `/admin`
- Admin link appears in navigation only for admin users
- All admin API endpoints require admin authentication

## Getting Started

### 1. Creating Your First Admin User

If you don't have any admin users yet, you can promote an existing user:

```bash
# List all users to see available usernames
bun run admin:list

# Promote a user to admin
bun run admin:make <username>
```

### 2. Accessing the Admin Panel

1. Sign in as an admin user
2. Click "Admin Panel" in the navigation bar
3. Navigate between sections using the tab interface

## Security Features

- **Role-based access control**: All endpoints verify admin status
- **Session validation**: Uses secure session tokens
- **Self-protection**: Prevents admins from accidentally removing their own access
- **Input validation**: All user inputs are validated using Zod schemas
- **CSRF protection**: Built into Next.js forms and tRPC mutations

## Admin Scripts

### User Management Scripts

```bash
# List all users and their roles
bun run admin:list

# Promote a user to admin role
bun run admin:make <username>
```

### Database Scripts

```bash
# Set up database and run migrations
bun run db:setup

# Generate new migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Open database studio
bun run db:studio
```

## API Endpoints

All admin endpoints are under the `admin` tRPC router:

### Statistics
- `admin.getDashboardStats` - Get overview statistics

### User Management
- `admin.getUsers` - Get paginated user list with filtering
- `admin.updateUserRole` - Change user role
- `admin.deleteUser` - Delete user account

### Mod Management
- `admin.getMods` - Get paginated mod list with filtering
- `admin.updateModStatus` - Toggle mod active/featured status
- `admin.deleteMod` - Delete mod

## Error Handling

The admin panel includes comprehensive error handling:

- **Network errors**: Retry mechanisms and error messages
- **Permission errors**: Clear feedback when actions aren't allowed
- **Validation errors**: Real-time validation feedback
- **Loading states**: Visual indicators during API calls

## Best Practices

1. **Regular backups**: Always backup before bulk operations
2. **Careful role changes**: Double-check before changing admin roles
3. **Monitor usage**: Use the dashboard to track platform health
4. **Test changes**: Use a staging environment for major changes
5. **Keep logs**: Monitor admin actions for security auditing

## Troubleshooting

### Common Issues

1. **"Admin access required" error**
   - Ensure user has "admin" role in database
   - Check session is valid
   - Verify user is logged in

2. **Cannot access admin panel**
   - Check if admin link appears in navigation
   - Verify role in database: `bun run admin:list`
   - Promote user if needed: `bun run admin:make <username>`

3. **Statistics not loading**
   - Check database connection
   - Verify all required tables exist
   - Run database migrations if needed

### Support

For technical issues:
1. Check the browser console for errors
2. Verify database connectivity
3. Check server logs for detailed error messages
4. Ensure all environment variables are set correctly
