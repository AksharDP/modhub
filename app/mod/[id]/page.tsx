"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import ModHeader from "@/app/components/modpage/ModHeader";
import ImageGallery from "@/app/components/modpage/ImageGallery";
import ModDetailsSidebar from "@/app/components/modpage/ModDetailsSidebar";
import { ModInterface } from "@/app/types/common";
import DatabaseError from "@/app/components/DatabaseError";
import TabNavigation from "@/app/components/modpage/TabNavigation";

export default function ModPage() {
    const { id } = useParams();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [mod, setMod] = useState<ModInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"description" | "files">("description");
    const [showAllFiles, setShowAllFiles] = useState(false);
    const filesTabRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) return;
        const fetchMod = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/mods/${id}`);
                if (res.status === 404) {
                    setMod(null);
                    setError(null);
                    return;
                }
                if (!res.ok) throw new Error("Failed to fetch mod");
                const modData = await res.json();
                if (!modData) throw new Error("Mod not found");
                // Transform to ModInterface
                const mod: ModInterface = {
                    modId: modData.id,
                    title: modData.title,
                    description: modData.description || "",
                    imageUrl: modData.thumbnailUrl || modData.imageUrl || "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod",
                    author: modData.author?.username || "Unknown",
                    authorPFP: modData.author?.profilePicture || "https://placehold.co/30x30/7C3AED/FFFFFF/png?text=U",
                    category: modData.category?.name || "Uncategorized",
                    likes: modData.stats?.likes || 0,
                    downloads: modData.stats?.totalDownloads || 0,
                    size: modData.size || "N/A",
                    uploaded: modData.createdAt || new Date(),
                    lastUpdated: modData.updatedAt || new Date(),
                    slug: modData.slug,
                    version: modData.version,
                    downloadUrl: modData.downloadUrl || "#",
                    stats: modData.stats,
                    allImageUrls: modData.images?.map((img: { url: string }) => img.url) || [
                        modData.thumbnailUrl || modData.imageUrl || "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod"
                    ],
                    tags: modData.tags || [],
                    game: modData.game || { id: 0, name: modData.game?.name || "Unknown", slug: modData.game?.slug || "unknown" },                    fileVersions: modData.files?.map((file: { 
                        id: number; 
                        version?: string; 
                        fileName: string; 
                        fileSize?: string; 
                        createdAt?: string | Date; 
                        url?: string; 
                        changelog?: string; 
                        isMainFile?: boolean; 
                    }) => ({
                        id: file.id.toString(),
                        version: file.version || "1.0.0",
                        fileName: file.fileName,
                        fileSize: file.fileSize || "N/A",
                        uploadDate: file.createdAt || new Date(),
                        downloadUrl: file.url || "#",
                        changelog: file.changelog || "",
                        isLatest: file.isMainFile || false,
                    })) || [],
                };
                setMod(mod);
            } catch (err) {
                setError((err as Error).message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchMod();
    }, [id]);

    const nextImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex === (mod?.allImageUrls?.length || 0) - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex === 0 ? (mod?.allImageUrls?.length || 0) - 1 : prevIndex - 1
        );
    };

    const formatDate = (date: string | number | Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleDownloadClick = () => {
        setActiveTab("files");
        setTimeout(() => {
            filesTabRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100); // A small delay to ensure the tab has rendered
    };

    if (loading) {
        return (
            <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="mt-2 text-gray-400">Loading mod...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <DatabaseError error={error} />;
    }

    if (!mod) {
        return (
            <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
                <div className="text-center text-red-400">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p>Mod not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
            <ModHeader mod={mod} gamename={mod.game?.slug || "unknown"} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-6">
                    <ImageGallery
                        modImages={{ title: mod.title, ImageUrls: mod.allImageUrls || [] }}
                        currentImageIndex={selectedImageIndex}
                        prevImage={prevImage}
                        nextImage={nextImage}
                        setCurrentImageIndex={setSelectedImageIndex}
                    />
                    <div className="w-full">
                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            fileCount={mod.fileVersions?.length || 0}
                        />
                        <div ref={filesTabRef}>
                            {activeTab === "description" && (
                                <div className="prose prose-invert max-w-none text-gray-200 bg-gray-800 rounded-lg p-6">
                                    {mod.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: mod.description }} />
                                    ) : (
                                        <span>No description provided.</span>
                                    )}
                                </div>
                            )}
                            {activeTab === "files" && (
                                <div>
                                    <div className="bg-gray-800 p-4 sm:p-6 rounded-[5px] shadow">
                                        {(!mod.fileVersions || mod.fileVersions.length === 0) ? (
                                            <div className="text-gray-400 text-center py-8">No files available for this mod.</div>
                                        ) : (
                                            <>
                                                <div className="space-y-6">
                                                    {(showAllFiles ? (mod.fileVersions || []) : (mod.fileVersions || []).slice(0, 5))
                                                        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                                                        .map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className={`rounded-[5px] shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out p-5 ${file.isLatest ? "bg-gray-700 border-l-4 border-purple-500" : "bg-gray-750"}`}
                                                            >
                                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                                                                    <h3 className="text-lg font-medium text-purple-400 mb-2 sm:mb-0">
                                                                        {file.fileName}{" "}
                                                                        {file.isLatest && (
                                                                            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full ml-2 align-middle">Latest</span>
                                                                        )}
                                                                    </h3>
                                                                    <a
                                                                        href={file.downloadUrl}
                                                                        className="mt-2 sm:mt-0 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
                                                                    >
                                                                        Download
                                                                    </a>
                                                                </div>
                                                                <div className="text-xs text-gray-400 space-y-0.5 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-1 mb-2">
                                                                    <span>Version: <span className="text-gray-300">{file.version}</span></span>
                                                                    <span>Size: <span className="text-gray-300">{file.fileSize}</span></span>
                                                                    <span>Uploaded: <span className="text-gray-300">{formatDate(file.uploadDate)}</span></span>
                                                                </div>
                                                                {file.changelog && (
                                                                    <details className="mt-3 text-sm group">
                                                                        <summary className="cursor-pointer text-gray-300 hover:text-white list-none flex items-center focus:outline-none py-1">
                                                                            <svg className="w-4 h-4 inline-block mr-1 group-open:rotate-180 transition-transform duration-150" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                                                                            View Changelog
                                                                        </summary>
                                                                        <div className="mt-2 p-3 bg-black bg-opacity-20 border border-gray-700 rounded text-gray-300 whitespace-pre-wrap text-xs">{file.changelog}</div>
                                                                    </details>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                                {(mod.fileVersions && mod.fileVersions.length > 5 && !showAllFiles) && (
                                                    <button
                                                        className="mt-6 w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded transition-colors"
                                                        onClick={() => setShowAllFiles(true)}
                                                    >
                                                        Show All Files
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>                <div className="md:col-span-1">
                    <ModDetailsSidebar 
                        mod={{
                            uploaded: mod.uploaded,
                            lastUpdated: mod.lastUpdated,
                            likes: mod.likes,
                            downloads: mod.downloads,
                            size: mod.size,
                            tags: mod.tags,
                            fileVersions: mod.fileVersions || []
                        }} 
                        formatDate={formatDate} 
                    />
                    {/* Download button moved outside sidebar */}
                    {mod.fileVersions && mod.fileVersions.length > 0 && (
                        <button
                            onClick={handleDownloadClick}
                            className="mt-4 flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded text-center transition-colors shadow-md hover:shadow-lg"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Download Latest
                            {(() => {
                                const latestFile = mod.fileVersions.find((f) => f.isLatest);
                                return latestFile ? ` (${latestFile.version})` : '';
                            })()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
