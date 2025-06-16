"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/app/components/card";
import { DragDropContext, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided } from "react-beautiful-dnd";
import { useAuth } from "@/app/contexts/AuthContext";
import { StrictModeDroppable } from "@/app/components/StrictModeDroppable";

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
        categoryId: number;
    };
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
        likes: number | null;
        totalDownloads: number | null;
        views: number | null;
        rating: number | null;
        ratingCount: number | null;
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
    const { user } = useAuth();
    const [collection, setCollection] = useState<CollectionData | null>(null);
    const [mods, setMods] = useState<ModData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingPrivacy, setEditingPrivacy] = useState(false);
    const [tempCollectionName, setTempCollectionName] = useState("");
    const [tempIsPublic, setTempIsPublic] = useState(true);    
    // Refs to prevent duplicate API calls
    const fetchingRef = useRef(false);

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setCollectionId(resolvedParams.id);
        };
        getParams();
    }, [params]);
    const fetchCollection = useCallback(async () => {
        if (!collectionId || fetchingRef.current) return;
        
        try {
            fetchingRef.current = true;
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/collections/${collectionId}`);
            if (!response.ok) {
                let apiError = "Failed to fetch collection";
                try {
                    const errJson = await response.json();
                    if (errJson?.error) apiError = errJson.error;
                } catch {
                    // ignore JSON parse error
                }
                console.error("API error response:", response.status, apiError);
                if (response.status === 404) {
                    throw new Error("Collection not found");
                }
                throw new Error(apiError);
            }            const data: ApiResponse = await response.json();
            setCollection(data.collection);
            setMods(data.mods);
            setLoading(false);
        } catch {
            setError("Failed to load collection");
            setLoading(false);
        } finally {
            fetchingRef.current = false;
        }
    }, [collectionId]);

    useEffect(() => {
        if (collectionId) {
            fetchCollection();
        }
    }, [collectionId, fetchCollection]);
    useEffect(() => {
        // Check if current user is owner after collection is loaded
        if (collection && user) {
            setIsOwner(user.id === collection.user?.id);
        } else {
            setIsOwner(false);
        }
    }, [collection, user]);
    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const originalMods = [...mods];
        const reordered = Array.from(mods);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setMods(reordered); // Optimistic update
        setSavingOrder(true);
        try {
            const resp = await fetch("/api/user/collections/mods", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionId: collectionId,
                    order: reordered.map((m) => m.mod.id),
                }),
            });
            if (!resp.ok) throw new Error("Failed to save order");
        } catch {
            setMods(originalMods); // Revert on error
        } finally {
            setSavingOrder(false);
        }
    };

    const handleDeleteMod = async (modId: number) => {
        const originalMods = [...mods];
        setMods(mods.filter(m => m.mod.id !== modId)); // Optimistic update
        try {
            const response = await fetch("/api/user/collections/mods", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionId: collectionId,
                    modId: modId,
                }),
            });
            if (!response.ok) throw new Error("Failed to delete mod");
        } catch {
            setMods(originalMods); // Revert on error
        }
    };

    const handleUpdateCollectionTitle = async () => {
        if (!tempCollectionName.trim() || !collection) return;
        
        try {
            const response = await fetch(`/api/user/collections/${collection.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: tempCollectionName.trim(),
                }),
            });
            
            if (response.ok) {
                setCollection({ ...collection, name: tempCollectionName.trim() });
                setEditingTitle(false);
            }
        } catch (error) {
            console.error("Error updating collection title:", error);
        }
    };

    const handleUpdateCollectionPrivacy = async () => {
        if (!collection) return;
        
        try {
            const response = await fetch(`/api/user/collections/${collection.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isPublic: tempIsPublic,
                }),
            });
            
            if (response.ok) {
                setCollection({ ...collection, isPublic: tempIsPublic });
                setEditingPrivacy(false);
            }
        } catch (error) {
            console.error("Error updating collection privacy:", error);
        }
    };    if (!collection && loading) {
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
            <div className="flex flex-col flex-1 bg-gray-900 text-white">
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center w-full">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
                        <p className="text-xl mb-4">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="flex flex-col flex-1 bg-gray-900 text-white">
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center w-full">
                        <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-8">                {/* Collection Header */}
                <div className="mb-6 px-4 py-4 bg-gray-800 rounded-lg border border-gray-700 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <nav className="text-xs text-gray-400">
                            <Link href="/collections" className="hover:text-purple-400">
                                Collections
                            </Link>
                            <span className="mx-1">/</span>
                            <span>{collection.name}</span>
                        </nav>
                        {isOwner && (
                            <button
                                onClick={() => {
                                    setEditMode(!editMode);
                                    if (editMode) {
                                        setEditingTitle(false);
                                        setEditingPrivacy(false);
                                    }
                                }}
                                className={`px-3 py-1 rounded text-xs transition-colors ${
                                    editMode
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                            >
                                {editMode ? 'Exit' : 'Edit Collection'}
                            </button>
                        )}
                    </div><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {editingTitle && isOwner ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={tempCollectionName}
                                            onChange={(e) => setTempCollectionName(e.target.value)}
                                            className="text-2xl font-bold text-purple-400 bg-gray-700 px-2 py-1 rounded flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateCollectionTitle();
                                                if (e.key === 'Escape') setEditingTitle(false);
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleUpdateCollectionTitle}
                                            className="text-green-400 hover:text-green-300"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setEditingTitle(false)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold text-purple-400 mb-1 truncate">
                                            {collection.name}
                                        </h1>
                                        {isOwner && (
                                            <button
                                                onClick={() => {
                                                    setTempCollectionName(collection.name);
                                                    setEditingTitle(true);
                                                }}
                                                className="text-gray-400 hover:text-purple-400 transition-colors"
                                                title="Edit title"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                                                    <path d="m15 5 4 4"/>
                                                </svg>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            {collection.description && (
                                <p className="text-gray-300 text-sm mb-1 truncate">
                                    {collection.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                                <Link 
                                    href={`/profile/${collection.user?.username}`}
                                    className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                                >
                                    <Image
                                        src={collection.user?.profilePicture || "https://placehold.co/24x24/7C3AED/FFFFFF/png?text=" + (collection.user?.username?.charAt(0).toUpperCase() || 'U')}
                                        alt={collection.user?.username || "User"}
                                        width={20}
                                        height={20}
                                        className="rounded-full border border-gray-700"
                                    />
                                    <span className="truncate max-w-[120px]">{collection.user?.username || "Unknown"}</span>
                                </Link>
                                <span className="hidden sm:inline">·</span>
                                <span>{mods.length} mods</span>
                                <span className="hidden sm:inline">·</span>
                                <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            {editingPrivacy && isOwner ? (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={tempIsPublic ? "public" : "private"}
                                        onChange={(e) => setTempIsPublic(e.target.value === "public")}
                                        className="text-xs bg-gray-700 text-white px-2 py-1 rounded"
                                        autoFocus
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                    <button
                                        onClick={handleUpdateCollectionPrivacy}
                                        className="text-green-400 hover:text-green-300"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => setEditingPrivacy(false)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    {collection.isPublic ? (
                                        <div className="flex items-center gap-1 text-green-400 bg-gray-700 px-2 py-1 rounded text-xs">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 009 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                                            </svg>
                                            <span>Public</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-gray-400 bg-gray-700 px-2 py-1 rounded text-xs">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2-2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                            </svg>
                                            <span>Private</span>
                                        </div>
                                    )}
                                    {isOwner && (
                                        <button
                                            onClick={() => {
                                                setTempIsPublic(collection.isPublic);
                                                setEditingPrivacy(true);
                                            }}
                                            className="text-gray-400 hover:text-purple-400 transition-colors ml-1"
                                            title="Edit privacy"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                                                <path d="m15 5 4 4"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>                {/* Mods Grid */}
                {mods.length > 0 ? (
                    isOwner && editMode ? (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <StrictModeDroppable
                                droppableId="mods-grid"
                                direction="horizontal"
                                isDropDisabled={false}
                                isCombineEnabled={false}
                                ignoreContainerClipping={false}
                                renderClone={undefined}
                                getContainerForClone={undefined}
                            >
                                {(provided: DroppableProvided) => (
                                    <div
                                        className="flex flex-wrap justify-center gap-6 mt-8"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {mods.map((modData, idx) => (
                                            <Draggable
                                                key={modData.mod.id}
                                                draggableId={modData.mod.id.toString()}
                                                index={idx}
                                                isDragDisabled={false}
                                                disableInteractiveElementBlocking={true}
                                                shouldRespectForcePress={false}
                                            >
                                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.7 : 1,
                                                            cursor: editMode ? (snapshot.isDragging ? 'grabbing' : 'grab') : 'default',
                                                        }}
                                                    >
                                                        <div className="relative group">
                                                            <Card
                                                                modId={modData.mod.id}
                                                                gameName={modData.game?.name || "Unknown"}
                                                                title={modData.mod.title}
                                                                description={modData.mod.description}
                                                                imageUrl={modData.mod.imageUrl || "/placeholder1.svg"}
                                                                author={modData.author?.username || "Unknown"}
                                                                authorPFP={modData.author?.profilePicture || "/placeholder1.svg"}
                                                                category={modData.category?.name || "Uncategorized"}
                                                                likes={modData.stats?.likes || 0}
                                                                downloads={modData.stats?.totalDownloads || 0}
                                                                size={modData.mod.size || "N/A"}
                                                                uploaded={modData.mod.createdAt}
                                                                lastUpdated={modData.mod.updatedAt}
                                                                hideDropdown={true}
                                                            />
                                                          <button
                                                              onClick={() => handleDeleteMod(modData.mod.id)}
                                                              className={`absolute top-3 right-3 w-9 h-9 bg-black bg-opacity-50 text-white rounded-full z-10 transition-all hover:bg-red-600 cursor-pointer flex items-center justify-center ${editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                              title="Remove from collection"
                                                          >
                                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                  <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                              </svg>
                                                          </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </StrictModeDroppable>
                        </DragDropContext>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-6 mt-8">
                            {mods.map((modData) => (                                <Card
                                    key={modData.mod.id}
                                    modId={modData.mod.id}
                                    gameName={modData.game?.name || "Unknown"}
                                    title={modData.mod.title}
                                    description={modData.mod.description}
                                    imageUrl={modData.mod.imageUrl || "/placeholder1.svg"}
                                    author={modData.author?.username || "Unknown"}
                                    authorPFP={modData.author?.profilePicture || "/placeholder1.svg"}
                                    category={modData.category?.name || "Uncategorized"}
                                    likes={modData.stats?.likes || 0}
                                    downloads={modData.stats?.totalDownloads || 0}
                                    size={modData.mod.size || "N/A"}
                                    uploaded={modData.mod.createdAt}
                                    lastUpdated={modData.mod.updatedAt}
                                    hideDropdown={false}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="text-2xl">This collection is empty.</p>
                        <p>No mods have been added yet.</p>
                    </div>
                )}
                {isOwner && savingOrder && (
                    <div className="text-center text-purple-400 mt-4">Saving order...</div>
                )}
            </div>
        </div>
    );
}
