"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface CollectionData {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number | null;
        username: string | null;
        profilePicture: string | null;
    };
}

interface ModData {
    mod: {
        id: number;
        title: string;
        description: string;
        imageUrl: string | null;
        version: string;
        size: string | null;
        createdAt: Date;
        updatedAt: Date;
        gameId: number;
        authorId: number;
    };
    author: {
        id: number | null;
        username: string | null;
        profilePicture: string | null;
    };
    addedAt: Date;
}

interface ApiResponse {
    collection: CollectionData;
    mods: ModData[];
}

interface CollectionViewClientProps {
    params: Promise<{ id: string }>;
}

export default function CollectionViewClient({ params }: CollectionViewClientProps) {
    const [collection, setCollection] = useState<CollectionData | null>(null);
    const [mods, setMods] = useState<ModData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collectionId, setCollectionId] = useState<string | null>(null);

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setCollectionId(resolvedParams.id);
        };
        getParams();
    }, [params]);    useEffect(() => {
        if (collectionId) {
            fetchCollection();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionId]);

    const fetchCollection = async () => {
        if (!collectionId) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`/api/collections/${collectionId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Collection not found");
                }
                throw new Error("Failed to fetch collection");
            }
            
            const data: ApiResponse = await response.json();
            setCollection(data.collection);
            setMods(data.mods);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load collection");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
                        <div className="h-6 bg-gray-700 rounded mb-2 w-1/4"></div>
                        <div className="h-4 bg-gray-700 rounded mb-8 w-1/2"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-gray-800 rounded-lg p-4">
                                    <div className="h-32 bg-gray-700 rounded mb-4"></div>
                                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-4"></div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full mr-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
                    <p className="text-xl mb-4">{error}</p>
                    <Link 
                        href="/collections"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Collections
                    </Link>
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
                    <Link 
                        href="/collections"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Collections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Collection Header */}
                <div className="mb-8">
                    <nav className="text-sm text-gray-400 mb-4">
                        <Link href="/collections" className="hover:text-purple-400">
                            Collections
                        </Link>
                        <span className="mx-2">/</span>
                        <span>{collection.name}</span>
                    </nav>
                    
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-grow">
                            <h1 className="text-4xl font-bold text-purple-400 mb-2">
                                {collection.name}
                            </h1>
                            {collection.description && (
                                <p className="text-gray-300 text-lg mb-4">
                                    {collection.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            {collection.isPublic ? (
                                <div className="flex items-center space-x-1 text-green-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-sm">Public</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1 text-gray-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-sm">Private</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href={`/author/${collection.user?.username}`}
                                className="flex items-center space-x-2 hover:text-purple-400 transition-colors"
                            >
                                <Image
                                    src={collection.user?.profilePicture || "https://placehold.co/24x24/7C3AED/FFFFFF/png?text=" + (collection.user?.username?.charAt(0).toUpperCase() || 'U')}
                                    alt={collection.user?.username || "User"}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span>by {collection.user?.username || "Unknown"}</span>
                            </Link>
                            <span>{mods.length} mods</span>
                        </div>
                        <span>
                            Created {new Date(collection.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Mods Grid */}
                {mods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mods.map((modData) => (
                            <div
                                key={modData.mod.id}
                                className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-750"
                            >
                                <Link href={`/mods/${modData.mod.id}`} className="block">
                                    <div className="h-48 relative">
                                        <Image
                                            src={modData.mod.imageUrl || "/placeholder1.svg"}
                                            alt={modData.mod.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                </Link>
                                
                                <div className="p-4">
                                    <Link href={`/mods/${modData.mod.id}`}>
                                        <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors mb-2">
                                            {modData.mod.title}
                                        </h3>
                                    </Link>
                                    
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                        {modData.mod.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <Link 
                                            href={`/author/${modData.author?.username}`}
                                            className="hover:text-purple-400 transition-colors"
                                        >
                                            by {modData.author?.username || "Unknown"}
                                        </Link>
                                        <span>v{modData.mod.version}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Size: {modData.mod.size || "N/A"}</span>
                                        <span>
                                            Added {new Date(modData.addedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="text-2xl">This collection is empty.</p>
                        <p>No mods have been added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
