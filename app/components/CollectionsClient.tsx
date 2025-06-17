import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Import Image for author profile picture

interface CollectionData {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
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
    const hasFetched = useRef(false);

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
        if (hasFetched.current) return;
        hasFetched.current = true;
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
                                className="bg-gray-800 rounded-lg overflow-hidden m-2 w-80 h-[400px] flex flex-col animate-pulse"
                            >
                                {/* Placeholder image */}
                                <div className="h-44 w-full bg-gray-700"></div>

                                {/* Content skeleton */}
                                <div className="flex-1 flex flex-col justify-between p-4">
                                    <div>
                                        {/* Title skeleton */}
                                        <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                        {/* Description skeleton */}
                                        <div className="h-4 bg-gray-700 rounded mb-1"></div>
                                        <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                                    </div>

                                    <div className="flex flex-col">
                                        {/* Author skeleton */}
                                        <div className="flex items-center mt-3 mb-2">
                                            <div className="w-6 h-6 bg-gray-700 rounded-full mr-2"></div>
                                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                                        </div>

                                        {/* Category badges skeleton - not applicable for collections, but keeping structure for layout consistency */}
                                        <div className="flex flex-nowrap gap-2 mt-2 mb-2" style={{ minHeight: "24px", maxHeight: "24px" }}>
                                            <div className="h-6 bg-gray-700 rounded w-16"></div>
                                            <div className="h-6 bg-gray-700 rounded w-20"></div>
                                        </div>
                                    </div>

                                    {/* Stats skeleton */}
                                    <div className="flex items-center justify-between text-xs mt-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                            <div className="h-4 bg-gray-700 rounded w-8"></div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                            <div className="h-4 bg-gray-700 rounded w-12"></div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                            <div className="h-4 bg-gray-700 rounded w-10"></div>
                                        </div>
                                    </div>

                                    {/* Dates skeleton */}
                                    <div className="flex items-center justify-between text-xs mt-2">
                                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                                    </div>
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
                                    className="bg-gray-800 text-white rounded-[var(--border-radius-custom)] shadow-lg m-2 w-80 h-[400px] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 relative group"
                                >
                                    <Link
                                        href={`/collections/${collection.id}`}
                                        className="block h-44 w-full relative group"
                                    >                                        <Image
                                            src={collection.imageUrl || "https://placehold.co/320x176/4F46E5/FFFFFF/png?text=Collection"}
                                            alt={collection.name}
                                            fill
                                            className="object-cover w-full h-full"
                                            sizes="320px"
                                            priority={false}
                                        />
                                    </Link>
                                    <div className="flex-1 flex flex-col justify-between p-4">
                                        <div>
                                            <Link
                                                href={`/collections/${collection.id}`}
                                                className="text-lg font-bold text-purple-300 hover:underline line-clamp-1"
                                            >
                                                {collection.name}
                                            </Link>
                                            <p className="text-gray-300 text-sm mt-1 line-clamp-2 min-h-[40px]">
                                                {collection.description || "No description available."}
                                            </p>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center mt-3 mb-2">
                                                <Link
                                                    href={`/profile/${collection.user?.username}`}
                                                    className="flex items-center hover:underline"
                                                >
                                                    <Image
                                                        src={collection.user?.profilePicture || "https://placehold.co/24x24/7C3AED/FFFFFF/png?text=U"}
                                                        alt={collection.user?.username || "Unknown"}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full mr-2 border border-purple-400"
                                                    />
                                                    <span className="text-xs text-gray-200">
                                                        {collection.user?.username || "Unknown"}
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                            <span title="Likes" className="flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
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
                                                {collection.likes}
                                            </span>
                                            <span
                                                title="Mods"
                                                className="flex items-center gap-1"
                                            >
                                                <svg
                                                    className="w-4 h-4 text-blue-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm7-9a1 1 0 00-1 1v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 00-1-1z" />
                                                </svg>
                                                {collection.modCount}
                                            </span>
                                            <span title="Total Size" className="flex items-center gap-1">
                                                <svg
                                                    className="w-4 h-4 text-green-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
                                                </svg>
                                                {collection.totalFileSize}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                            <span title="Created">
                                                Created{" "}
                                                {new Date(collection.createdAt).toLocaleDateString(
                                                    undefined,
                                                    { year: "numeric", month: "long", day: "numeric" }
                                                )}
                                            </span>
                                            <span title="Last Updated">
                                                Updated{" "}
                                                {new Date(collection.updatedAt).toLocaleDateString(
                                                    undefined,
                                                    { year: "numeric", month: "long", day: "numeric" }
                                                )}
                                            </span>
                                        </div>
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