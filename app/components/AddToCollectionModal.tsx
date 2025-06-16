"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import CollectionsModalLoading from "./CollectionsModalLoading";

interface Collection {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AddToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    modId: number;
    modTitle: string;
}

export default function AddToCollectionModal({
    isOpen,
    onClose,
    modId,
    modTitle,
}: AddToCollectionModalProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<Set<number>>(
        new Set()
    );
    const [loading, setLoading] = useState(false);
    const [processingCollection, setProcessingCollection] = useState<
        number | null
    >(null);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false);
    const checkModInCollections = useCallback(
        async (collectionsToCheck: Collection[]) => {
            try {
                const promises = collectionsToCheck.map(async (collection) => {
                    const response = await fetch(
                        `/api/collections/${collection.id}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            collectionId: collection.id,
                            hasMod: data.mods.some(
                                (mod: { id: number }) => mod.id === modId
                            ),
                        };
                    }
                    return { collectionId: collection.id, hasMod: false };
                });

                const results = await Promise.all(promises);
                const selected = new Set<number>();
                results.forEach((result) => {
                    if (result.hasMod) {
                        selected.add(result.collectionId);
                    }
                });
                setSelectedCollections(selected);
            } catch (error) {
                console.error("Failed to check mod in collections:", error);
            }
        },
        [modId]
    );

    const fetchUserCollections = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/user/collections");
            if (response.ok) {
                const data = await response.json();
                setCollections(data.collections);
                await checkModInCollections(data.collections);
            }
        } catch (error) {
            console.error("Failed to fetch collections:", error);
        } finally {
            setLoading(false);
        }
    }, [checkModInCollections]);

    useEffect(() => {
        if (isOpen) {
            fetchUserCollections();
        }
    }, [isOpen, fetchUserCollections]);
    const handleCollectionToggle = async (collectionId: number) => {
        setProcessingCollection(collectionId);
        const isCurrentlySelected = selectedCollections.has(collectionId);

        try {
            if (isCurrentlySelected) {
                const response = await fetch("/api/user/collections/mods", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ collectionId, modId }),
                });

                if (response.ok) {
                    const newSelected = new Set(selectedCollections);
                    newSelected.delete(collectionId);
                    setSelectedCollections(newSelected);
                }
            } else {
                const response = await fetch("/api/user/collections/mods", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ collectionId, modId }),
                });

                if (response.ok) {
                    const newSelected = new Set(selectedCollections);
                    newSelected.add(collectionId);
                    setSelectedCollections(newSelected);
                }
            }
        } catch (error) {
            console.error("Failed to toggle mod in collection:", error);
        } finally {
            setProcessingCollection(null);
        }
    };
    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;

        setCreating(true);
        try {
            const response = await fetch("/api/user/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCollectionName.trim(),
                    isPublic: newCollectionIsPublic,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCollections([...collections, data.collection]);
                setNewCollectionName("");
                setNewCollectionIsPublic(false);
                setShowCreateForm(false);
            }
        } catch (error) {
            console.error("Failed to create collection:", error);
        } finally {
            setCreating(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        {" "}
                        <h2 className="text-lg font-semibold text-white">
                            Manage &ldquo;{modTitle}&rdquo; Collections
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div
                    className="flex-1 overflow-y-auto px-4 py-3"
                    style={{ minHeight: "300px" }}
                >
                    <Suspense fallback={<CollectionsModalLoading />}>
                        {loading ? (
                            <CollectionsModalLoading />
                        ) : (
                            <div className="space-y-2">
                                {" "}
                                {showCreateForm ? (
                                    <div className="p-3 bg-gray-750 rounded-lg border border-gray-600 mb-2">
                                        <h3 className="text-white font-medium mb-2 flex items-center text-sm">
                                            <svg
                                                className="w-3.5 h-3.5 mr-1.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            New Collection
                                        </h3>
                                        <div className="space-y-2">
                                            {" "}
                                            <input
                                                type="text"
                                                placeholder="Collection name"
                                                value={newCollectionName}
                                                onChange={(e) =>
                                                    setNewCollectionName(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        newCollectionName.trim() &&
                                                        !creating
                                                    ) {
                                                        handleCreateCollection();
                                                    }
                                                }}
                                                className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                autoFocus
                                            />
                                            <div className="flex items-center justify-between">
                                                <span className="text-white text-xs">
                                                    Collection visibility
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <rect
                                                            width="18"
                                                            height="11"
                                                            x="3"
                                                            y="11"
                                                            rx="2"
                                                            ry="2"
                                                        />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setNewCollectionIsPublic(
                                                                !newCollectionIsPublic
                                                            )
                                                        }
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                                            newCollectionIsPublic
                                                                ? "bg-purple-600"
                                                                : "bg-gray-600"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                                                newCollectionIsPublic
                                                                    ? "translate-x-5"
                                                                    : "translate-x-0.5"
                                                            }`}
                                                        />
                                                    </button>
                                                    <svg
                                                        className="w-4 h-4 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                                        <path d="M2 12h20" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={
                                                        handleCreateCollection
                                                    }
                                                    disabled={
                                                        !newCollectionName.trim() ||
                                                        creating
                                                    }
                                                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium"
                                                >
                                                    {creating
                                                        ? "Creating..."
                                                        : "Create"}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowCreateForm(false)
                                                    }
                                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="w-full flex items-center space-x-2.5 p-2 rounded-md hover:bg-gray-700 cursor-pointer text-left transition-colors mb-2"
                                    >
                                        <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-md">
                                            <svg
                                                className="w-3.5 h-3.5 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-white font-medium text-sm">
                                            New Collection
                                        </span>
                                    </button>
                                )}{" "}
                                {collections.length > 0 && (
                                    <>
                                        <div className="py-1">
                                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-1 mb-1">
                                                Your Collections
                                            </h4>
                                        </div>
                                        <div className="space-y-0.5">
                                            {" "}
                                            {collections.map((collection) => {
                                                const isSelected =
                                                    selectedCollections.has(
                                                        collection.id
                                                    );
                                                const isProcessing =
                                                    processingCollection ===
                                                    collection.id;
                                                return (
                                                    <div
                                                        key={collection.id}
                                                        onClick={() =>
                                                            !isProcessing &&
                                                            handleCollectionToggle(
                                                                collection.id
                                                            )
                                                        }
                                                        className={`flex items-center space-x-2.5 p-2 rounded-md hover:bg-gray-700 cursor-pointer transition-colors ${
                                                            isProcessing
                                                                ? "opacity-50"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors ${
                                                                isSelected
                                                                    ? "bg-purple-600 border-purple-600"
                                                                    : "border-gray-500 hover:border-gray-400"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <svg
                                                                    className="w-3 h-3 text-white"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>{" "}
                                                        <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-md flex-shrink-0">
                                                            <svg
                                                                className="w-3.5 h-3.5 text-white"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-white font-medium truncate text-sm">
                                                                    {
                                                                        collection.name
                                                                    }
                                                                </span>
                                                                {collection.isPublic ? (
                                                                    <svg
                                                                        className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-2"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                ) : (
                                                                    <svg
                                                                        className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 ml-2"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            {collection.description && (
                                                                <p className="text-gray-400 text-xs truncate mt-0.5">
                                                                    {
                                                                        collection.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                                {collections.length === 0 &&
                                    !showCreateForm && (
                                        <div className="text-center text-gray-400 py-8">
                                            <svg
                                                className="w-12 h-12 mx-auto mb-3 text-gray-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                            </svg>
                                            <p className="text-sm font-medium mb-1">
                                                No collections yet
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Create your first collection
                                                above
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
