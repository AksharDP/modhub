"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "./card";
import DatabaseError from "./DatabaseError";

interface ModData {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    version: string | null;
    imageUrl: string | null;
    size: string | null;
    isAdult: boolean | null;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: number | null;
        username: string | null;
        profilePicture: string | null;
    };
    game: {
        id: number | null;
        name: string | null;
        slug: string | null;
    };
    category: {
        id: number | null;
        name: string | null;
        slug: string | null;
        color: string | null;
    };
    stats: {
        totalDownloads: number | null;
        likes: number | null;
        rating: number | null;
        ratingCount: number | null;
    };
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface ApiResponse {
    mods: ModData[];
    pagination: PaginationData;
}

export default function ModsClient() {
    const [mods, setMods] = useState<ModData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");

    const fetchMods = async (page: number, showInitialLoading = false) => {
        try {
            if (showInitialLoading) {
                setLoading(true);
            }
            setError(null);
            
            const response = await fetch(`/api/mods?page=${page}&limit=12`);
            if (!response.ok) {
                throw new Error("Failed to fetch mods");
            }
            
            const data: ApiResponse = await response.json();
            setMods(data.mods);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load mods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMods(currentPage, true);
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage || !pagination) return;
        
        // Smooth scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update URL without page reload
        const params = new URLSearchParams(searchParams.toString());
        if (newPage === 1) {
            params.delete("page");
        } else {
            params.set("page", newPage.toString());
        }
        
        const newUrl = params.toString() ? `/mods?${params.toString()}` : "/mods";
        router.push(newUrl, { scroll: false });
    };

    if (error) {
        return <DatabaseError error={error} />;
    }

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Recent Mods
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Explore the latest additions to our modding community.
                    </p>
                </header>
                
                {loading ? (
                    <div className="flex flex-wrap justify-center">
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={index}
                                className="w-80 h-96 m-4 bg-gray-800 rounded-lg animate-pulse"
                            >
                                <div className="h-48 bg-gray-700 rounded-t-lg"></div>
                                <div className="p-4">
                                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-4"></div>
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full mr-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : mods && mods.length > 0 ? (
                    <>
                        <div className="flex flex-wrap justify-center">                            {mods.map((mod) => (
                                <Card
                                    key={mod.id}
                                    modId={mod.id}
                                    gameName={mod.game?.slug || "unknown"}
                                    title={mod.title}
                                    description={mod.description || ""}
                                    imageUrl={
                                        mod.imageUrl ||
                                        "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod"
                                    }
                                    author={mod.author?.username || "Unknown"}
                                    authorPFP={
                                        mod.author?.profilePicture ||
                                        "https://placehold.co/30x30/7C3AED/FFFFFF/png?text=U"
                                    }
                                    category={mod.category?.name || "Other"}
                                    likes={mod.stats?.likes || 0}
                                    downloads={mod.stats?.totalDownloads || 0}
                                    size={mod.size || "N/A"}
                                    uploaded={mod.createdAt || new Date()}
                                    lastUpdated={mod.updatedAt || new Date()}
                                    isAdult={mod.isAdult || false}
                                />
                            ))}
                        </div>
                        
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
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
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                                        const isCurrentPage = page === currentPage;
                                        const showPage = 
                                            page === 1 || 
                                            page === pagination.totalPages || 
                                            Math.abs(page - currentPage) <= 2;
                                        
                                        if (!showPage) {
                                            if (page === currentPage - 3 || page === currentPage + 3) {
                                                return (
                                                    <span key={page} className="px-2 py-2 text-gray-400">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }
                                        
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
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
                                    onClick={() => handlePageChange(currentPage + 1)}
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
                                Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.totalCount)} of {pagination.totalCount} mods
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="text-2xl">No mods found.</p>
                        <p>Check back later for new additions!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
