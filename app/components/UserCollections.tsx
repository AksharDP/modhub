"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Collection {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    modCount?: number;
}

interface UserCollectionsProps {
    userId?: number;
    username?: string;
    isOwnProfile?: boolean;
}

export default function UserCollections({ userId, username, isOwnProfile = false }: UserCollectionsProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] = useState("");
    const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);    const fetchCollections = useCallback(async () => {
        setLoading(true);
        try {
            let url = "/api/user/collections";
            if (!isOwnProfile && userId) {
                url = `/api/user/${userId}/collections`;
            }
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setCollections(data.collections);
            } else {
                throw new Error("Failed to fetch collections");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load collections");
        } finally {
            setLoading(false);
        }
    }, [userId, isOwnProfile]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;

        setCreating(true);
        try {
            const response = await fetch("/api/user/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCollectionName.trim(),
                    description: newCollectionDescription.trim() || null,
                    isPublic: newCollectionIsPublic,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCollections([data.collection, ...collections]);
                setNewCollectionName("");
                setNewCollectionDescription("");
                setNewCollectionIsPublic(false);
                setShowCreateForm(false);
            } else {
                throw new Error("Failed to create collection");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create collection");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                    {isOwnProfile ? "My Collections" : `${username}&apos;s Collections`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                            <div className="h-6 bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded mb-3"></div>
                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                    {isOwnProfile ? "My Collections" : `${username}&apos;s Collections`}
                </h2>
                {isOwnProfile && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Create Collection
                    </button>
                )}
            </div>

            {/* Create Collection Form */}
            {showCreateForm && isOwnProfile && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Collection</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Collection Name *
                            </label>
                            <input
                                type="text"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                placeholder="Enter collection name"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={newCollectionDescription}
                                onChange={(e) => setNewCollectionDescription(e.target.value)}
                                placeholder="Enter description (optional)"
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={newCollectionIsPublic}
                                    onChange={(e) => setNewCollectionIsPublic(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-white">Make collection public</span>
                            </label>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCreateCollection}
                                disabled={!newCollectionName.trim() || creating}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {creating ? "Creating..." : "Create Collection"}
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Collections Grid */}
            {collections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white truncate">
                                    {collection.name}
                                </h3>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                    {collection.isPublic ? (
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            
                            {collection.description && (
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                    {collection.description}
                                </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-sm">
                                    {collection.modCount || 0} mods
                                </span>
                                <Link
                                    href={`/collections/${collection.id}`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 py-8">
                    <p className="text-lg">
                        {isOwnProfile 
                            ? "You haven't created any collections yet." 
                            : `${username} hasn't created any public collections yet.`
                        }
                    </p>
                    {isOwnProfile && (
                        <p className="text-sm mt-2">
                            Create your first collection to organize your favorite mods!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
