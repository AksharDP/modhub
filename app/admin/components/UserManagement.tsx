"use client";

import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import Image from "next/image";
import type { User } from "@/app/db/schema";

interface UserManagementProps {
    initialUsers: User[];
    initialPagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export default function UserManagement({
    initialUsers,
    initialPagination,
}: UserManagementProps) {
    const [page, setPage] = useState(0);
    const [roleFilter, setRoleFilter] = useState<
        "admin" | "user" | "supporter" | undefined
    >(undefined);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<number | null>(null);    const [users, setUsers] = useState(initialUsers);
    const [pagination, setPagination] = useState(initialPagination);
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const limit = 20;
    const offset = page * limit;

    // SSR optimization: Only fetch via API after first load or when filters/page/search change
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/getUsers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    limit,
                    offset,
                    role: roleFilter,
                    search: searchTerm || undefined,
                }),
            });
            const data = await res.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } finally {
            setIsLoading(false);
        }
    };    // Only fetch after first load and when filters/pagination change
    useEffect(() => {
        if (!isFirstLoad) {
            fetchUsers();
        } else {
            setIsFirstLoad(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, roleFilter, searchTerm]);    const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation({
        onSuccess: () => {
            fetchUsers();
            setEditingUser(null);
        },
    });

    const deleteUserMutation = trpc.admin.deleteUser.useMutation({
        onSuccess: () => {
            fetchUsers();
        },
    });

    const handleRoleChange = async (
        userId: number,
        newRole: "admin" | "user" | "supporter"
    ) => {
        if (
            confirm(
                `Are you sure you want to change this user's role to ${newRole}?`
            )
        ) {
            try {
                await updateUserRoleMutation.mutateAsync({
                    userId,
                    role: newRole,
                });
            } catch (error) {
                alert(
                    "Failed to update user role: " + (error as Error).message
                );
            }
        }
    };

    const handleDeleteUser = async (userId: number, username: string) => {
        if (
            confirm(
                `Are you sure you want to delete user "${username}"? This action cannot be undone.`
            )
        ) {
            try {
                await deleteUserMutation.mutateAsync({ userId });
            } catch (error) {
                alert("Failed to delete user: " + (error as Error).message);
            }
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-600 text-red-100";
            case "supporter":
                return "bg-yellow-600 text-yellow-100";
            case "user":
                return "bg-gray-600 text-gray-100";
            default:
                return "bg-gray-600 text-gray-100";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                    User Management
                </h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    />
                    {/* Fix: Only allow valid role values for filter, never pass a raw string */}
                    <select
                        value={roleFilter ?? ""} // roleFilter state is of type "admin" | "user" | "supporter" | undefined
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue === "admin" || selectedValue === "user" || selectedValue === "supporter") {
                                setRoleFilter(selectedValue); // selectedValue is now one of the enum literals
                            } else {
                                setRoleFilter(undefined); // Handle cases like empty string for "All Roles"
                            }
                        }}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="supporter">Supporter</option>
                    </select>
                </div>
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
                                    Actions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
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
                                                {user.bio && (
                                                    <div className="text-sm text-gray-400 truncate max-w-xs">
                                                        {user.bio}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUser === user.id ? (
                                            <select
                                                defaultValue={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        user.id,
                                                        e.target.value as
                                                            | "admin"
                                                            | "user"
                                                            | "supporter"
                                                    )
                                                }
                                                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-orange-400"
                                            >
                                                <option value="user">
                                                    User
                                                </option>
                                                <option value="supporter">
                                                    Supporter
                                                </option>
                                                <option value="admin">
                                                    Admin
                                                </option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    user.role.slice(1)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.createdAt
                                            ? new Date(
                                                  user.createdAt
                                              ).toLocaleDateString()
                                            : "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                                        <div className="flex flex-col items-center justify-center gap-2 h-full">
                                            <button
                                                onClick={() =>
                                                    setEditingUser(
                                                        editingUser === user.id
                                                            ? null
                                                            : user.id
                                                    )
                                                }
                                                className="text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                                            >
                                                {editingUser === user.id
                                                    ? "Cancel"
                                                    : "Edit Role"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        user.id,
                                                        user.username
                                                    )
                                                }
                                                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                                disabled={
                                                    deleteUserMutation.isPending
                                                }
                                            >
                                                Delete
                                            </button>
                                            <a
                                                href={`/author/${encodeURIComponent(
                                                    user.username
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                            >
                                                View Profile
                                            </a>
                                        </div>
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
                                                        ).toLocaleDateString()})
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Showing {offset + 1} to{" "}
                        {Math.min(offset + limit, pagination.total)} of{" "}
                        {pagination.total} users
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                            className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!pagination.hasMore}
                            className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
