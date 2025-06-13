"use client";
import { useState, use } from "react";

import ModHeader from "@/app/components/modpage/ModHeader";
import ImageGallery from "@/app/components/modpage/ImageGallery";
import ModDetailsSidebar from "@/app/components/modpage/ModDetailsSidebar";
import TabNavigation from "@/app/components/modpage/TabNavigation";
import DescriptionSection from "@/app/components/modpage/DescriptionSection";
import FilesSection from "@/app/components/modpage/FilesSection";
import { ModInterface } from "@/app/types/common";
import { trpc } from "@/app/lib/trpc";
import DatabaseError from "@/app/components/DatabaseError";

export default function ModPage({
    params,
}: {
    params: Promise<{ gamename: string; modid: string }>;
}) {
    const { gamename, modid } = use(params);
    
    const [activeTab, setActiveTab] = useState<"description" | "files">(
        "description"
    );
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    
    // Validate that modid is a valid number
    const modIdNumber = parseInt(modid);
    if (isNaN(modIdNumber)) {
        return (
            <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
                <div className="text-center text-red-400">
                    <p>Invalid mod ID</p>
                </div>
            </div>
        );
    }
    
    // Query the database for the mod
    const {
        data: modData,
        isLoading,
        error,
    } = trpc.mod.getModById.useQuery({ id: modIdNumber });

    // Show loading state
    if (isLoading) {
        return (
            <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="mt-2 text-gray-400">Loading mod...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        const isDatabaseError =
            error.message.includes("DATABASE_URL") ||
            error.message.includes("Failed query") ||
            error.message.includes("connection") ||
            error.message.includes("does not exist");

        if (isDatabaseError) {
            return <DatabaseError error={error.message} />;
        }
        return (
            <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
                <div className="text-center text-red-400">
                    <p>Error loading mod: {error.message}</p>
                </div>
            </div>
        );
    }

    // No mod found
    if (!modData) {
        return (
            <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
                <div className="text-center text-red-400">
                    <p>Mod not found</p>
                </div>
            </div>
        );
    }    // Transform database data to ModInterface format
    const mod: ModInterface = {
        modId: modData.id,
        title: modData.title,
        description: modData.description || "",
        imageUrl: modData.imageUrl || "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod",
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
        allImageUrls: modData.images?.map(img => img.imageUrl) || [modData.imageUrl || "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod"],
        tags: modData.tags || [],
        game: modData.game || { id: 0, name: gamename, slug: gamename },
        fileVersions: modData.files?.map(file => ({
            id: file.id.toString(),
            version: file.version || "1.0.0",
            fileName: file.fileName,
            fileSize: file.fileSize || "N/A",
            uploadDate: file.createdAt || new Date(),
            downloadUrl: file.fileUrl || "#",
            changelog: "",
            isLatest: file.isMainFile || false,
        })) || [],
    };

    const nextImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex === (mod.allImageUrls?.length || 0) - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex === 0 ? (mod.allImageUrls?.length || 0) - 1 : prevIndex - 1
        );
    };

    const formatDate = (date: string | number | Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="container px-32 py-8 bg-gray-900 text-white min-h-screen">
            <ModHeader mod={mod} gamename={gamename} />

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
                        <div>
                            {activeTab === "description" && (
                                <DescriptionSection mod={{ ...mod, Description: mod.description || "" }} />
                            )}
                            {activeTab === "files" && (
                                <FilesSection
                                    mod={{ ...mod, fileVersions: mod.fileVersions || [] }}
                                    gamename={gamename}
                                    modid={modid}
                                    formatDate={formatDate}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <ModDetailsSidebar mod={{...mod, fileVersions: mod.fileVersions || []}} formatDate={formatDate} />
                </div>
            </div>
        </div>
    );
}
