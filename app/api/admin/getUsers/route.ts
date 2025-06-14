import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth";
import { db } from "../../../db";
import { userTable } from "../../../db/schema";
import { eq, desc, and, count, SQLWrapper, sql } from "drizzle-orm";

export async function POST(req: Request) {
    const { user } = await getCurrentSession();
    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { limit = 20, offset = 0, role, search } = body;

    const conditions: SQLWrapper[] = [];

    if (role) {
        conditions.push(eq(userTable.role, role));
    }

    if (search) {
        conditions.push(
            sql`(${userTable.username} ILIKE ${`%${search}%`} OR ${userTable.email} ILIKE ${`%${search}%`})`
        );
    }

    const users = await db
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
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(userTable.createdAt))
        .limit(limit)
        .offset(offset);

    const [{ count: total }] = await db
        .select({ count: count() })
        .from(userTable)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

    const pagination = {
        total: Number(total),
        limit,
        offset,
        hasMore: offset + limit < Number(total),
    };

    // Add passwordHash for type compatibility (empty string is fine for UI)
    const usersWithPasswordHash = users.map(u => ({
        ...u,
        passwordHash: "",
    }));

    return NextResponse.json({ 
        users: usersWithPasswordHash, 
        pagination 
    });
}
