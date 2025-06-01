"use client";
import Image from "next/image"; // Keep Image if used by ModHeader or other direct children, otherwise can be removed if only sub-components use it.
import { useState, use } from "react";

// Import sub-components
import ModHeader from "@/app/components/modpage/ModHeader";
import ImageGallery from "@/app/components/modpage/ImageGallery";
import ModDetailsSidebar from "@/app/components/modpage/ModDetailsSidebar";
import TabNavigation from "@/app/components/modpage/TabNavigation";
import DescriptionSection from "@/app/components/modpage/DescriptionSection";
import FilesSection from "@/app/components/modpage/FilesSection";

// Define interfaces for the data (can be moved to a types file later)
interface FileVersion {
    id: string;
    version: string;
    fileName: string;
    fileSize: string;
    uploadDate: string | number | Date;
    downloadUrl: string;
    changelog?: string;
    isLatest: boolean;
}

interface ModPageProps {
    title: string;
    imageUrl: string; // This might be part of allImageUrls[0] or a specific cover image
    author: string;
    authorPFP: string;
    category: string;
    likes: number;
    downloads: number;
    size: string;
    uploaded: string | number | Date;
    lastUpdated: string | number | Date;
    allImageUrls: string[];
    fullDescription: string;
    fileVersions: FileVersion[];
    tags?: string[];
}

// Mock data for demonstration
const mockModData: ModPageProps = {
    title: "Awesome Mod Title",
    imageUrl: "/next.svg", // Potentially redundant if allImageUrls[0] is the main image
    author: "Modder Extraordinaire",
    authorPFP: "/vercel.svg",
    category: "Gameplay",
    likes: 1234,
    downloads: 56789,
    size: "100 MB",
    uploaded: new Date("2024-01-15T10:00:00Z"),
    lastUpdated: new Date("2025-05-20T14:30:00Z"),
    allImageUrls: ["/next.svg", "/globe.svg", "/file.svg", "/window.svg"],
    fullDescription: `
        <p>This is the <strong>full description</strong> of the awesome mod. It can contain <em>rich text</em> and multiple paragraphs.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <h2>Features</h2>
        <ul>
            <li>Feature A</li>
            <li>Feature B</li>
            <li>Feature C</li>
        </ul>
        <h2>Requirements</h2>
        <p>Requires ModFramework v2.0 or higher.</p>
        <h2>Installation</h2>
        <p>Follow these steps to install...</p>
    `,
    fileVersions: [
        {
            id: "3",
            version: "1.1.0",
            fileName: "AwesomeMod_v1.1.0.zip",
            fileSize: "105 MB",
            uploadDate: new Date("2025-05-20T14:30:00Z"),
            downloadUrl: "#",
            changelog: "Fixed bugs, added new feature X.",
            isLatest: true,
        },
        {
            id: "2",
            version: "1.0.1",
            fileName: "AwesomeMod_v1.0.1.zip",
            fileSize: "102 MB",
            uploadDate: new Date("2025-03-10T12:00:00Z"),
            downloadUrl: "#",
            changelog: "Minor bug fixes.",
            isLatest: false,
        },
        {
            id: "1",
            version: "1.0.0",
            fileName: "AwesomeMod_v1.0.0.zip",
            fileSize: "100 MB",
            uploadDate: new Date("2025-01-15T10:00:00Z"),
            downloadUrl: "#",
            changelog: "Initial release.",
            isLatest: false,
        },
    ],
    tags: ["Overhaul", "Graphics", "New Mechanics"],
};

export default function ModPage({
    params,
}: {
    params: Promise<{ gamename: string; modid: string }>;
}) {
    const { gamename, modid } = use(params);
    const mod = {
        ...mockModData,
        title: `${mockModData.title} for ${gamename} (Mod ID: ${modid})`,
    };

    const [activeTab, setActiveTab] = useState<"description" | "files">(
        "description"
    );
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === mod.allImageUrls.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? mod.allImageUrls.length - 1 : prevIndex - 1
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
        <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen max-w-7xl">
            <ModHeader mod={mod} gamename={gamename} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Image Gallery and Tabs */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <ImageGallery
                        mod={mod}
                        currentImageIndex={currentImageIndex}
                        prevImage={prevImage}
                        nextImage={nextImage}
                        setCurrentImageIndex={setCurrentImageIndex}
                    />
                    {/* Tabbed Content Area */}
                    <div className="w-full">
                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            fileCount={mod.fileVersions.length}
                        />
                        <div>
                            {activeTab === "description" && (
                                <DescriptionSection mod={mod} />
                            )}
                            {activeTab === "files" && (
                                <FilesSection
                                    mod={mod}
                                    gamename={gamename}
                                    modid={modid}
                                    formatDate={formatDate}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Mod Details Sidebar */}
                {/* Wrap ModDetailsSidebar in a div with explicit column span */}
                <div className="md:col-span-1">
                    <ModDetailsSidebar mod={mod} formatDate={formatDate} />
                </div>
            </div>
        </div>
    );
}
