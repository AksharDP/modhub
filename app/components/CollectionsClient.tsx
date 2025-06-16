"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CollectionData {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number | null;
        username: string | null;
        profilePicture: string | null;
    };
    modCount: number;
    totalFileSize: string;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface ApiResponse {
    collections: CollectionData[];
    pagination: PaginationData;
}

export default function CollectionsClient() {
    const [collections, setCollections] = useState<CollectionData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");

    const fetchCollections = async (
        page: number,
        showInitialLoading = false
    ) => {
        try {
            if (showInitialLoading) {
                setLoading(true);
            }
            setError(null);

            const response = await fetch(
                `/api/collections?page=${page}&limit=12`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch collections");
            }

            const data: ApiResponse = await response.json();
            setCollections(data.collections);
            setPagination(data.pagination);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load collections"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections(currentPage, true);
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage || !pagination) return;

        window.scrollTo({ top: 0, behavior: "smooth" });

        const params = new URLSearchParams(searchParams.toString());
        if (newPage === 1) {
            params.delete("page");
        } else {
            params.set("page", newPage.toString());
        }

        const newUrl = params.toString()
            ? `/collections?${params.toString()}`
            : "/collections";
        router.push(newUrl, { scroll: false });
    };

    if (error) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                <p className="text-xl text-red-500">
                    Failed to load collections.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Browse Collections
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Discover curated mod collections from the community.
                    </p>
                </header>{" "}
                {loading ? (
                    <div className="flex flex-wrap justify-center">
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-lg overflow-hidden m-2 w-80 animate-pulse"
                            >
                                <div className="p-5">
                                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    </div>
                                    <div className="h-10 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : collections && collections.length > 0 ? (
                    <>
                        <div className="flex flex-wrap justify-center">
                            {collections.map((collection) => (
                                <div
                                    key={collection.id}
                                    className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col m-2 w-80 hover:bg-gray-750"
                                >
                                    {" "}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-start justify-between mb-3">
                                            <h2 className="text-xl font-semibold text-white truncate flex-grow">
                                                {collection.name}
                                            </h2>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-3 flex-grow">
                                            {collection.description ||
                                                "No description available."}
                                        </p>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                            <Link
                                                href={`/profile/${collection.user?.username}`}
                                                className="hover:text-purple-400 transition-colors"
                                            >
                                                by{" "}
                                                {collection.user?.username ||
                                                    "Unknown"}
                                            </Link>                                            <div className="flex items-center space-x-1">                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-heart-icon lucide-heart"
                                                >
                                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                </svg>
                                                <span>{collection.likes}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span>
                                                {collection.modCount} mods
                                            </span>
                                            <span>
                                                {collection.totalFileSize}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/collections/${collection.id}`}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
                                        >
                                            View Collection
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 space-x-2">
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={!pagination.hasPreviousPage}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        pagination.hasPreviousPage
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    Previous
                                </button>

                                <div className="flex space-x-1">
                                    {Array.from(
                                        { length: pagination.totalPages },
                                        (_, i) => i + 1
                                    ).map((page) => {
                                        const isCurrentPage =
                                            page === currentPage;
                                        const showPage =
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            Math.abs(page - currentPage) <= 2;

                                        if (!showPage) {
                                            if (
                                                page === currentPage - 3 ||
                                                page === currentPage + 3
                                            ) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="px-2 py-2 text-gray-400"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                                    isCurrentPage
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={!pagination.hasNextPage}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        pagination.hasNextPage
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {pagination && (
                            <div className="text-center mt-4 text-gray-400 text-sm">
                                Showing {(currentPage - 1) * 12 + 1} to{" "}
                                {Math.min(
                                    currentPage * 12,
                                    pagination.totalCount
                                )}{" "}
                                of {pagination.totalCount} collections
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="text-2xl">No public collections found.</p>
                        <p>Check back later or create your own!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
