import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth";
import UserManagement from "../components/UserManagement";
import AdminNavigation from "../components/AdminNavigation";
import { db } from "../../db";
import { userTable } from "../../db/schema";
import { desc, count } from "drizzle-orm";

export default async function AdminUsersPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    // Fetch initial user list server-side
    const limit = 20;
    const offset = 0;
    const usersRaw = await db
        .select({
            id: userTable.id,
            username: userTable.username,
            email: userTable.email,
            role: userTable.role,
            profilePicture: userTable.profilePicture,
            bio: userTable.bio,
            createdAt: userTable.createdAt,
            updatedAt: userTable.updatedAt,
            suspendedUntil: userTable.suspendedUntil,
        })
        .from(userTable)
        .orderBy(desc(userTable.createdAt))
        .limit(limit)
        .offset(offset);
    const [{ count: total }] = await db
        .select({ count: count() })
        .from(userTable);
    const pagination = {
        total: Number(total),
        limit,
        offset,
        hasMore: offset + limit < Number(total),
    };

    // Fix: Add passwordHash: "" to each user object if not needed for UI
    const users = usersRaw.map(u => ({ ...u, passwordHash: "" }));

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminNavigation />
                <UserManagement initialUsers={users} initialPagination={pagination} />
            </div>
        </div>
    );
}
