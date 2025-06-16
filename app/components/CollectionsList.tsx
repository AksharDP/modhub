"use client";

import { useState, useEffect } from "react";
import CollectionsModalLoading from "./CollectionsModalLoading";

interface Collection {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface CollectionsListProps {
    selectedCollections: Set<number>;
    onCollectionToggle: (collectionId: number) => void;
}

export default function CollectionsList({ selectedCollections, onCollectionToggle }: CollectionsListProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/user/collections");
            if (response.ok) {
                const data = await response.json();
                setCollections(data.collections);
            }
        } catch (error) {
            console.error("Failed to fetch collections:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CollectionsModalLoading />;
    }

    return (
        <>
            {collections.length > 0 ? (
                <div className="space-y-3 mb-4">
                    {collections.map((collection) => (
                        <label
                            key={collection.id}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCollections.has(collection.id)}
                                onChange={() => onCollectionToggle(collection.id)}
                                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                            />
                            <div className="flex-grow">
                                <div className="flex items-center space-x-2">
                                    <span className="text-white font-medium">
                                        {collection.name}
                                    </span>
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
                                {collection.description && (
                                    <p className="text-gray-400 text-sm">
                                        {collection.description}
                                    </p>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 py-4">
                    You don&apos;t have any collections yet.
                </div>
            )}
        </>
    );
}
