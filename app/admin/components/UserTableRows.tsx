import Image from "next/image";
import { db } from "../../db";
import { userTable } from "../../db/schema";
import { desc, like, eq, or, and, gte } from "drizzle-orm";

interface UserTableRowsProps {
    search?: string;
    role?: string;
    status?: string;
    joinDate?: string;
    limit: number;
    offset: number;
}

export default async function UserTableRows({
    search = "",
    role = "",
    status = "",
    joinDate = "",
    limit,
    offset,
}: UserTableRowsProps) {
    // Build query conditions
    const conditions = [];

    if (search) {
        conditions.push(
            or(
                like(userTable.username, `%${search}%`),
                like(userTable.email, `%${search}%`)
            )
        );
    }    if (role && ["admin", "user", "supporter", "banned", "suspended"].includes(role)) {
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
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(userTable.createdAt))
        .limit(limit)
        .offset(offset);

    const users = usersRaw.map((u) => ({ ...u }));

    return (
        <>
            {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                <Image
                                    className="rounded-full"
                                    src={
                                        user.profilePicture ||
                                        "https://placehold.co/40x40/8A2BE2/FFFFFF/png"
                                    }
                                    alt={`${user.username}'s profile picture`}
                                    width={40}
                                    height={40}
                                    unoptimized={
                                        !!user.profilePicture &&
                                        user.profilePicture.startsWith("http")
                                    }
                                />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                    {user.username}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                    ? "bg-red-600 text-red-100"
                                    : user.role === "supporter"
                                    ? "bg-yellow-600 text-yellow-100"
                                    : "bg-gray-600 text-gray-100"
                            }`}
                        >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                        {user.role === "banned" && (
                            <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-red-800 text-red-200">
                                Banned
                            </span>
                        )}
                        {user.role === "suspended" && (
                            <span className="flex flex-col items-center justify-center min-w-[56px] min-h-[28px] px-1 py-0.5 rounded text-[10px] font-bold bg-yellow-800 text-yellow-200 text-center">
                                <span className="w-full text-center leading-tight">
                                    Suspended
                                </span>
                                {user.suspendedUntil ? (
                                    <span className="block break-words text-yellow-100 font-normal w-full text-center leading-tight">
                                        (until{" "}
                                        {new Date(user.suspendedUntil).toLocaleDateString()}
                                        )
                                    </span>
                                ) : null}
                            </span>
                        )}
                        {user.role !== "banned" && user.role !== "suspended" && (
                            <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-200">
                                Active
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                        <div className="flex flex-wrap gap-2 min-w-[180px] justify-center items-center">
                            <a
                                href={`/author/${encodeURIComponent(user.username)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-blue-700 hover:bg-blue-600 text-white py-1 px-2 transition-colors font-semibold shadow-sm text-xs"
                                style={{
                                    minWidth: 80,
                                    textAlign: "center",
                                }}
                            >
                                View
                            </a>
                            <form
                                method="POST"
                                action={`/admin/users/${user.id}/ban`}
                                className="inline"
                            >
                                <button
                                    type="submit"
                                    className="rounded bg-red-700 hover:bg-red-600 text-white py-1 px-2 transition-colors font-semibold shadow-sm text-xs"
                                    style={{ minWidth: 60 }}
                                >
                                    Ban
                                </button>
                            </form>
                            <form
                                method="POST"
                                action={`/admin/users/${user.id}/suspend`}
                                className="inline-flex gap-1 items-center"
                            >
                                <input
                                    type="date"
                                    name="suspendUntil"
                                    className="px-1 py-0.5 rounded bg-gray-700 text-white border border-gray-600 text-xs w-[90px]"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="rounded bg-yellow-600 hover:bg-yellow-500 text-white py-1 px-2 transition-colors font-semibold shadow-sm text-xs"
                                    style={{ minWidth: 60 }}
                                >
                                    Suspend
                                </button>
                            </form>
                            <form
                                method="POST"
                                action={`/admin/users/${user.id}/delete`}
                                className="inline"
                            >
                                <button
                                    type="submit"
                                    className="rounded bg-orange-700 hover:bg-orange-600 text-white py-1 px-2 transition-colors font-semibold shadow-sm text-xs"
                                    style={{ minWidth: 60 }}
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}
