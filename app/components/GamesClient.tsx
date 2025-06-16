"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface GameData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    modCount: number;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface ApiResponse {
    games: GameData[];
    pagination: PaginationData;
}

export default function GamesClient() {
    const [games, setGames] = useState<GameData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");

    const fetchGames = async (page: number, showInitialLoading = false) => {
        try {
            if (showInitialLoading) {
                setLoading(true);
            }
            setError(null);
            
            const response = await fetch(`/api/games?page=${page}&limit=12`);
            if (!response.ok) {
                throw new Error("Failed to fetch games");
            }
            
            const data: ApiResponse = await response.json();
            setGames(data.games);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load games");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames(currentPage, true);
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
        
        const newUrl = params.toString() ? `/games?${params.toString()}` : "/games";
        router.push(newUrl, { scroll: false });
    };

    if (error) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                <p className="text-xl text-red-500">Failed to load games.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Browse Games
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Discover mods for your favorite games.
                    </p>
                </header>

                {loading ? (
                    <div className="flex flex-wrap justify-center">
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-lg overflow-hidden m-2 w-80 animate-pulse"
                            >
                                <div className="w-full h-48 bg-gray-700"></div>
                                <div className="p-5">
                                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : games && games.length > 0 ? (
                    <>
                        <div className="flex flex-wrap justify-center">
                            {games.map((game) => (
                                <div
                                    key={game.id}
                                    className="bg-gray-800 rounded-[var(--border-radius-card)] shadow-xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col m-2 w-80"
                                >
                                    <Link href={`/games/${game.slug}`}>
                                        <div className="relative w-full h-48 cursor-pointer">
                                            <Image
                                                src={
                                                    game.imageUrl ||
                                                    "https://placehold.co/400x225/374151/FFFFFF/png?text=No+Image"
                                                }
                                                alt={game.name}
                                                fill
                                                className="transition-transform duration-300 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300"></div>
                                        </div>
                                    </Link>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <Link href={`/games/${game.slug}`}>
                                            <h2 className="text-xl font-semibold text-white transition-colors duration-300 mb-1 truncate hover:text-purple-400 cursor-pointer">
                                                {game.name}
                                            </h2>
                                        </Link>
                                        <p className="text-gray-400 text-sm mb-3 flex-grow h-16 overflow-hidden">
                                            {game.description ||
                                                "No description available."}
                                        </p>
                                        <div className="mt-auto">
                                            <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full transition-colors duration-300">
                                                {game.modCount.toLocaleString()} Mods
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
                                Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.totalCount)} of {pagination.totalCount} games
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="text-2xl">No games found.</p>
                        <p>Check back later for new additions!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
