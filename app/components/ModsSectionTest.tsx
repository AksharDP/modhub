"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "./card";
import CardSkeleton from "./CardSkeleton";
import DatabaseError from "./DatabaseError";

interface ModData {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    version: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    thumbnailAlt: string | null;
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

interface ModsSectionProps {
    apiEndpoint: string; // "/api/mods" or "/api/featured-mods"
    title: string;
    subtitle?: string;
    limit?: number;
    showPagination?: boolean;
    redirectUrl?: string; // URL to redirect to when changing pages
    containerClassName?: string;
    headerClassName?: string;
}

export default function ModsSectionTest({
    apiEndpoint,
    title,
    subtitle,
    limit = 12,
    showPagination = true,
    redirectUrl = "/mods",
    containerClassName = "bg-gray-900 min-h-screen flex flex-col",
    headerClassName = "mb-8 text-center"
}: ModsSectionProps) {
    const [mods, setMods] = useState<ModData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");

    useEffect(() => {
        const fetchMods = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('Fetching mods from:', `${apiEndpoint}?page=${currentPage}&limit=${limit}`);
                
                const response = await fetch(`${apiEndpoint}?page=${currentPage}&limit=${limit}`);
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch mods: ${response.status}`);
                }
                
                const data: ApiResponse = await response.json();
                
                console.log('Received data:', data);
                
                setMods(data.mods);
                setPagination(data.pagination);
            } catch (err) {
                console.error('Error fetching mods:', err);
                setError(err instanceof Error ? err.message : "Failed to load mods");
            } finally {
                setLoading(false);
            }
        };

        fetchMods();
    }, [currentPage, apiEndpoint, limit]);

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
        
        const newUrl = params.toString() ? `${redirectUrl}?${params.toString()}` : redirectUrl;
        router.push(newUrl, { scroll: false });
    };

    if (error) {
        return <DatabaseError error={error} />;
    }

    return (
        <div className={containerClassName}>
            <main className="flex-grow container mx-auto px-4 py-8">
                <header className={headerClassName}>
                    <h1 className="text-4xl font-bold text-purple-400">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-gray-400 mt-2">
                            {subtitle}
                        </p>
                    )}
                </header>
                
                {loading ? (
                    <div className="flex flex-wrap justify-center">
                        {[...Array(limit)].map((_, index) => (
                            <CardSkeleton key={index} />
                        ))}
                    </div>
                ) : mods && mods.length > 0 ? (
                    <>
                        <div className="flex flex-wrap justify-center">
                            {mods.map((mod) => (
                                <Card key={mod.id} mod={mod} />
                            ))}
                        </div>
                        
                        {pagination && showPagination && pagination.totalPages > 1 && (
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
                                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalCount)} of {pagination.totalCount} mods
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
