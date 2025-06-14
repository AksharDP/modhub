import React, { Suspense } from "react";
import UserTableRows from "./UserTableRows";
import UserTableRowsLoading from "./UserTableRowsLoading";

interface UserManagementProps {
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
                            <Suspense fallback={<UserTableRowsLoading />}>
                                <UserTableRows
                                    search={search}
                                    role={role}
                                    status={status}
                                    joinDate={joinDate}
                                    limit={limit}
                                    offset={offset}
                                />
                            </Suspense>
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
