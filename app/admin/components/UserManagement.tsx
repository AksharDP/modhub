import Image from "next/image";
import React from "react";

interface UserManagementProps {
    users: Array<{
        id: number;
        username: string;
        email: string;
        role: string;
        profilePicture: string | null;
        bio: string | null;
        createdAt: Date | string | null;
        updatedAt: Date | string | null;
        suspendedUntil: Date | string | null;
    }>;
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
    search?: string;
    role?: string;
    status?: string;
    joinDate?: string;
}

export default function UserManagement({
    users,
    pagination,
    search = "",
    role = "",
    status = "",
    joinDate = "",
}: UserManagementProps) {
    const limit = pagination.limit;
    const offset = pagination.offset;
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <form className="flex flex-wrap gap-2 items-center" method="GET">
                    <input
                        type="text"
                        placeholder="Search users..."
                        defaultValue={search}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                        name="search"
                    />
                    <input
                        type="date"
                        defaultValue={joinDate}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                        placeholder="Join date"
                        name="joinDate"
                    />
                    <select
                        defaultValue={role}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                        name="role"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="supporter">Supporter</option>
                        <option value="banned">Banned</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <select
                        defaultValue={status}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                        name="status"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </form>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
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
                                                        user.profilePicture.startsWith(
                                                            "http"
                                                        )
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
                                        <div className="text-sm text-gray-300">
                                            {user.email}
                                        </div>
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
                                            {user.role
                                                .charAt(0)
                                                .toUpperCase() +
                                                user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.createdAt
                                            ? new Date(
                                                  user.createdAt
                                              ).toLocaleDateString()
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
                                                        {new Date(
                                                            user.suspendedUntil
                                                        ).toLocaleDateString()}
                                                        )
                                                    </span>
                                                ) : null}
                                            </span>
                                        )}
                                        {user.role !== "banned" &&
                                            user.role !== "suspended" && (
                                                <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-200">
                                                    Active
                                                </span>
                                            )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                                        <div className="flex flex-wrap gap-2 min-w-[180px] justify-center items-center">
                                            <a
                                                href={`/author/${encodeURIComponent(
                                                    user.username
                                                )}`}
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
                        </tbody>
                    </table>
                </div>
            </div>
            {pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4" style={{marginBottom: 0, paddingBottom: 0}}>
                    <div className="text-sm text-gray-400">
                        Showing {offset + 1} to{" "}
                        {Math.min(offset + limit, pagination.total)} of{" "}
                        {pagination.total} users
                    </div>
                    <div className="flex items-center gap-2">
                        <form method="GET" className="flex items-center gap-2 mb-0 pb-0" style={{marginBottom: 0, paddingBottom: 0}}>
                            <label
                                htmlFor="perPage"
                                className="text-sm text-gray-300"
                            >
                                Users per page:
                            </label>
                            <select
                                id="perPage"
                                name="limit"
                                defaultValue={limit}
                                className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 text-sm"
                                style={{ minWidth: 60 }}
                            >
                                {[10, 20, 50, 100].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
