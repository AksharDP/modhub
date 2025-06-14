"use client";

import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import Image from "next/image";
import ModEditModal from "./ModEditModal";

export interface ModWithRelations {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    version: string;
    imageUrl: string | null;
    isActive: boolean | null;
    isFeatured: boolean | null;
    createdAt: Date | null;
    author: { id: number; username: string } | null;
    game: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
    stats: {
        totalDownloads: number | null;
        likes: number | null;
        views: number | null;
        rating: number | null;
    } | null;
}

export interface ModPagination {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export default function ModManagement({
    initialMods,
    initialPagination,
    games,
    categories,
}: {
    initialMods: ModWithRelations[];
    initialPagination: ModPagination;
    games: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}) {
    const [page, setPage] = useState(0);
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
        undefined
    );
    const [isFeaturedFilter, setIsFeaturedFilter] = useState<
        boolean | undefined
    >(undefined);
    const [searchTerm, setSearchTerm] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingModId, setEditingModId] = useState<number | null>(null);

    const limit = 20;
    const offset = page * limit;

    // SSR: Use initial data for first render, then tRPC for subsequent fetches
    const [mods, setMods] = useState(initialMods);
    const [pagination, setPagination] = useState(initialPagination);
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // Only fetch via tRPC after first load or when filters/page/search change
    const fetchMods = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/getMods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    limit,
                    offset,
                    isActive: isActiveFilter,
                    isFeatured: isFeaturedFilter,
                    search: searchTerm || undefined,
                }),
            });
            const data = await res.json();
            setMods(data.mods);
            setPagination(data.pagination);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isFirstLoad) {
            fetchMods();
        } else {
            setIsFirstLoad(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, isActiveFilter, isFeaturedFilter, searchTerm]);

    const updateModStatusMutation = trpc.admin.updateModStatus.useMutation({
        onSuccess: () => {
            fetchMods();
        },
    });

    const deleteModMutation = trpc.admin.deleteMod.useMutation({
        onSuccess: () => {
            fetchMods();
        },
    });

    const handleStatusToggle = async (
        modId: number,
        isActive: boolean,
        isFeatured?: boolean
    ) => {
        try {
            await updateModStatusMutation.mutateAsync({
                modId,
                isActive,
                isFeatured,
            });
        } catch (error) {
            alert("Failed to update mod status: " + (error as Error).message);
        }
    };

    const handleDeleteMod = async (modId: number, title: string) => {
        if (
            confirm(
                `Are you sure you want to delete mod "${title}"? This action cannot be undone.`
            )
        ) {
            try {
                await deleteModMutation.mutateAsync({ modId });
            } catch (error) {
                alert("Failed to delete mod: " + (error as Error).message);
            }
        }
    };

    const openEditModal = (modId: number) => {
        setEditingModId(modId);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingModId(null);
    };

    const handleEditSuccess = () => {
        fetchMods();
        closeEditModal();
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
                    Mod Management
                </h2>
                <div className="flex gap-3 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search mods..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    />
                    <select
                        value={
                            isActiveFilter === undefined
                                ? ""
                                : isActiveFilter.toString()
                        }
                        onChange={(e) =>
                            setIsActiveFilter(
                                e.target.value === ""
                                    ? undefined
                                    : e.target.value === "true"
                            )
                        }
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                    <select
                        value={
                            isFeaturedFilter === undefined
                                ? ""
                                : isFeaturedFilter.toString()
                        }
                        onChange={(e) =>
                            setIsFeaturedFilter(
                                e.target.value === ""
                                    ? undefined
                                    : e.target.value === "true"
                            )
                        }
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                    >
                        <option value="">All Featured</option>
                        <option value="true">Featured</option>
                        <option value="false">Not Featured</option>
                    </select>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Mod
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Author
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Game
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Stats
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
                            {mods.map((mod) => (
                                <tr key={mod.id} className="hover:bg-gray-750">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-12">
                                                <Image
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                    src={
                                                        mod.imageUrl ||
                                                        "https://placehold.co/48x48/8A2BE2/FFFFFF/png"
                                                    }
                                                    alt={
                                                        mod.title || "Mod image"
                                                    }
                                                    width={48}
                                                    height={48}
                                                    unoptimized={mod.imageUrl?.startsWith(
                                                        "http"
                                                    )}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">
                                                    {mod.title}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    v{mod.version}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                    {mod.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {mod.author?.username || "Unknown"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {mod.game?.name || "Unknown"}
                                        </div>
                                        {mod.category && (
                                            <div className="text-xs text-gray-500">
                                                {mod.category.name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <div>
                                                📥{" "}
                                                {mod.stats?.totalDownloads || 0}
                                            </div>
                                            <div>
                                                ❤️ {mod.stats?.likes || 0}
                                            </div>
                                            <div>
                                                👀 {mod.stats?.views || 0}
                                            </div>
                                            <div>
                                                ⭐ {mod.stats?.rating || 0}/5
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                {" "}
                                                <input
                                                    type="checkbox"
                                                    checked={!!mod.isActive}
                                                    onChange={(e) =>
                                                        handleStatusToggle(
                                                            mod.id,
                                                            e.target.checked,
                                                            !!mod.isFeatured
                                                        )
                                                    }
                                                    className="mr-2 rounded focus:ring-orange-400"
                                                />{" "}
                                                <span
                                                    className={`text-sm ${
                                                        !!mod.isActive
                                                            ? "text-green-400"
                                                            : "text-red-400"
                                                    }`}
                                                >
                                                    {!!mod.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                {" "}
                                                <input
                                                    type="checkbox"
                                                    checked={!!mod.isFeatured}
                                                    onChange={(e) =>
                                                        handleStatusToggle(
                                                            mod.id,
                                                            !!mod.isActive,
                                                            e.target.checked
                                                        )
                                                    }
                                                    disabled={!mod.isActive}
                                                    className="mr-2 rounded focus:ring-orange-400 disabled:opacity-50"
                                                />{" "}
                                                <span
                                                    className={`text-sm ${
                                                        !!mod.isFeatured
                                                            ? "text-yellow-400"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    Featured
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col space-y-2">
                                            <a
                                                href={`/${mod.game?.name}/mods/${mod.id}`}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Mod
                                            </a>
                                            <button
                                                onClick={() =>
                                                    handleDeleteMod(
                                                        mod.id,
                                                        mod.title
                                                    )
                                                }
                                                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                                disabled={
                                                    deleteModMutation.isPending
                                                }
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => openEditModal(mod.id)}
                                                className="text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        </div>
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
                        Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} mods
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
            {editModalOpen && editingModId !== null && (
                <ModEditModal
                    modId={editingModId}
                    isOpen={editModalOpen}
                    onClose={closeEditModal}
                    onSuccess={handleEditSuccess}
                    games={games}
                    categories={categories}
                />
            )}
        </div>
    );
}
