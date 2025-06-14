import { db } from "../../db";
import { userTable } from "../../db/schema";
import { count, like, eq, or, and, gte } from "drizzle-orm";

interface UserCountProps {
    search?: string;
    role?: string;
    status?: string;
    joinDate?: string;
}

export default async function UserCount({
    search = "",
    role = "",
    status = "",
    joinDate = "",
}: UserCountProps) {
    // Build query conditions - same as UserTableRows
    const conditions = [];

    if (search) {
        conditions.push(
            or(
                like(userTable.username, `%${search}%`),
                like(userTable.email, `%${search}%`)
            )
        );
    }

    if (role && ["admin", "user", "supporter", "banned", "suspended"].includes(role)) {
        conditions.push(eq(userTable.role, role as "admin" | "user" | "supporter" | "banned" | "suspended"));
    }

    if (status) {
        if (status === "active") {
            conditions.push(
                and(
                    eq(userTable.role, "user"),
                    or(
                        eq(userTable.role, "admin"),
                        eq(userTable.role, "supporter")
                    )
                )
            );
        } else if (status === "banned") {
            conditions.push(eq(userTable.role, "banned"));
        } else if (status === "suspended") {
            conditions.push(eq(userTable.role, "suspended"));
        }
    }

    if (joinDate) {
        conditions.push(gte(userTable.createdAt, new Date(joinDate)));
    }

    const [{ count: total }] = await db
        .select({ count: count() })
        .from(userTable)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(total);
}
