"use client";
import Image from "next/image";
import { useState, use } from "react"; // Import use

// Define interfaces for the data
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
    imageUrl: string;
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

// Mock data for demonstration - replace with actual data fetching
const mockModData: ModPageProps = {
    title: "Awesome Mod Title", // Will be overridden if fetched by modid
    imageUrl: "/next.svg",
    author: "Modder Extraordinaire",
    authorPFP: "/vercel.svg",
    category: "Gameplay",
    likes: 1234,
    downloads: 56789,
    size: "100 MB",
    uploaded: new Date("2024-01-15T10:00:00Z"),
    lastUpdated: new Date("2025-05-20T14:30:00Z"),
    allImageUrls: [
        "/next.svg",
        "/globe.svg",
        "/file.svg",
        "/window.svg",
        "/placeholder1.svg",
        "/placeholder2.svg",
        "/placeholder3.svg",
        "/placeholder4.svg",
        "/placeholder5.svg",
        "/placeholder6.svg",
        "/placeholder7.svg",
        "/placeholder8.svg",
    ],
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
    const { gamename, modid } = use(params); // Unwrap params using use()
    // In a real app, you'd fetch data based on gamename and modid.
    // For now, we can use mockModData and potentially customize it or log the params.
    // console.log(`Displaying mod ${modid} for game ${gamename}`);
    const mod = {
        ...mockModData,
        title: `${mockModData.title} for ${gamename} (Mod ID: ${modid})`,
    }; // Example of using params

    const [activeTab, setActiveTab] = useState<"description" | "files">(
        "description"
    );
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const IMAGES_PER_VIEW = 4; // Number of images to show in the gallery view at once

    const nextImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex === mod.allImageUrls.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setSelectedImageIndex((prevIndex) =>
            prevIndex === 0 ? mod.allImageUrls.length - 1 : prevIndex - 1
        );
    };

    const numImages = mod.allImageUrls.length;

    // Determine the current page of images to display in the gallery view
    const currentViewPage = Math.floor(selectedImageIndex / IMAGES_PER_VIEW);
    const viewStartIndex = currentViewPage * IMAGES_PER_VIEW;

    // Get the actual image objects to display in the current view
    const imagesToDisplayInView = mod.allImageUrls
        .slice(viewStartIndex, Math.min(viewStartIndex + IMAGES_PER_VIEW, numImages))
        .map((url, indexInSlice) => ({
            url,
            originalIndex: viewStartIndex + indexInSlice,
        }));

    const formatDate = (date: string | number | Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto px-32 py-8 bg-gray-900 text-white min-h-screen">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-purple-400">
                    {mod.title}
                </h1>
                <p className="text-xs text-gray-500">
                    Game: {gamename}
                </p>
                <div className="flex items-center text-xs text-gray-400 mt-0.5">
                    <Image
                        src={mod.authorPFP}
                        alt={`${mod.author}'s profile picture`}
                        width={20}
                        height={20}
                        className="rounded-full mr-1.5"
                    />
                    <span>By {mod.author}</span>
                    <span className="mx-1.5">|</span>
                    <span>
                        Category:{" "}
                        <a
                            href={`/categories/${mod.category.toLowerCase()}`}
                            className="text-purple-300 hover:underline"
                        >
                            {mod.category}
                        </a>
                    </span>
                </div>
            </header>

            {/* Replaced "grid grid-cols-1 md:grid-cols-3 gap-4" with space-y-6 for vertical stacking */}
            <div className="space-y-6">
                {/* Image Gallery Section - now takes full width */}
                <div> {/* Removed md:col-span-2 */}
                    {mod.allImageUrls && mod.allImageUrls.length > 0 && (
                        // This container holds the gallery view and its navigation
                        <div className="relative w-full bg-gray-800 rounded-md shadow-md p-2">
                            {/* Gallery View: Row of Images */}
                            <div className="flex space-x-2 justify-center">
                                {imagesToDisplayInView.map((image) => (
                                    <div
                                        key={image.originalIndex}
                                        className={`cursor-pointer rounded-md transition-all w-1/4 aspect-video relative group ${ // Adjusted: removed explicit heights, added aspect-video
                                            selectedImageIndex === image.originalIndex
                                                ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-800" // Highlight for selected image
                                                : "ring-1 ring-gray-700 hover:ring-purple-400"
                                        }`}
                                        onClick={() => setSelectedImageIndex(image.originalIndex)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && setSelectedImageIndex(image.originalIndex)}
                                        aria-label={`View image ${image.originalIndex + 1}`}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={`${mod.title} - image ${image.originalIndex + 1}`}
                                            layout="fill"
                                            objectFit="cover" 
                                            className="rounded-md"
                                            priority={image.originalIndex < IMAGES_PER_VIEW} // Prioritize images in the first potential view
                                            loading={image.originalIndex < IMAGES_PER_VIEW ? undefined : "lazy"}
                                        />
                                    </div>
                                ))}
                                {/* Fill remaining flex items if less than IMAGES_PER_VIEW to maintain w-1/4 */}
                                {imagesToDisplayInView.length > 0 && imagesToDisplayInView.length < IMAGES_PER_VIEW &&
                                    Array.from({ length: IMAGES_PER_VIEW - imagesToDisplayInView.length }).map((_, i) => (
                                        <div key={`placeholder-${i}`} className="w-1/4 aspect-video" /> // Placeholder: removed explicit heights, added aspect-video
                                    ))
                                }
                            </div>

                            {/* Global Next/Prev buttons for selectedImageIndex, navigating through all images */}
                            {numImages > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute top-1/2 left-1 sm:left-1.5 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-70 transition-opacity text-base sm:text-lg z-10"
                                        aria-label="Previous image"
                                    >
                                        &lt;
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute top-1/2 right-1 sm:right-1.5 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-70 transition-opacity text-base sm:text-lg z-10"
                                        aria-label="Next image"
                                    >
                                        &gt;
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Mod Details Section - moved here, takes full width, restyled for horizontal content */}
                <div className="bg-gray-800 p-4 rounded-md shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-purple-300"> {/* Increased mb slightly for heading */}
                        Mod Details
                    </h2>
                    {/* Grid for two-column layout on medium screens and up */}
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 gap-y-4">
                        {/* Left Column: Primary Details */}
                        <div>
                            <div className="flex flex-col space-y-1.5 text-xs"> {/* Changed to flex-col for consistent spacing */}
                                <p>
                                    <strong>Uploaded:</strong>{" "}
                                    {formatDate(mod.uploaded)}
                                </p>
                                <p>
                                    <strong>Last Updated:</strong>{" "}
                                    {formatDate(mod.lastUpdated)}
                                </p>
                                <p>
                                    <strong>Likes:</strong> {mod.likes.toLocaleString()}
                                </p>
                                <p>
                                    <strong>Downloads:</strong>{" "}
                                    {mod.downloads.toLocaleString()}
                                </p>
                                <p>
                                    <strong>Size:</strong> {mod.size}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Tags and Download Button */}
                        <div>
                            {mod.tags && mod.tags.length > 0 && (
                                <div className="mb-3">
                                    <strong>Tags:</strong>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {mod.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-gray-700 text-xs px-1.5 py-0.5 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mod.fileVersions.find((f) => f.isLatest) && (
                                <a
                                    href={
                                        mod.fileVersions.find((f) => f.isLatest)
                                            ?.downloadUrl
                                    }
                                    className="mt-3 block w-full sm:w-auto sm:inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center transition-colors text-sm" // Adjusted padding and display for button
                                >
                                    Download Latest (
                                    {mod.fileVersions.find((f) => f.isLatest)?.version})
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Section - takes full width */}
                <div className="mt-0"> {/* Removed md:col-span-3. mt-0 is fine, space-y-6 on parent handles top margin. */}
                    <div className="border-b border-gray-700 mb-3">
                        <nav
                            className="-mb-px flex space-x-6"
                            aria-label="Tabs"
                        >
                            <button
                                onClick={() => setActiveTab("description")}
                                className={`${
                                    activeTab === "description"
                                        ? "border-purple-500 text-purple-400"
                                        : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs sm:text-sm`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab("files")}
                                className={`${
                                    activeTab === "files"
                                        ? "border-purple-500 text-purple-400"
                                        : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs sm:text-sm`}
                            >
                                Files ({mod.fileVersions.length})
                            </button>
                        </nav>
                    </div>

                    <div>
                        {activeTab === "description" && (
                            <article className="prose prose-invert prose-xs sm:prose-sm lg:prose-base max-w-none bg-gray-800 p-3 sm:p-4 rounded-md shadow">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: mod.fullDescription,
                                    }}
                                />
                            </article>
                        )}

                        {activeTab === "files" && (
                            <div className="bg-gray-800 p-3 sm:p-4 rounded-md shadow">
                                <h2 className="text-lg font-semibold mb-3 text-purple-300">
                                    Available Files
                                </h2>
                                <div className="space-y-3">
                                    {mod.fileVersions
                                        .sort(
                                            (a, b) =>
                                                new Date(
                                                    b.uploadDate
                                                ).getTime() -
                                                new Date(a.uploadDate).getTime()
                                        )
                                        .map((file) => (
                                            <div
                                                key={file.id}
                                                className={`p-3 rounded ${
                                                    file.isLatest
                                                        ? "bg-gray-700 border-l-2 border-purple-500"
                                                        : "bg-gray-750"
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1.5">
                                                    <h3 className="text-base font-medium text-purple-400">
                                                        {file.fileName}{" "}
                                                        {file.isLatest && (
                                                            <span className="text-2xs bg-purple-500 text-white px-1 py-0.5 rounded-full ml-1.5 align-middle leading-none"> {/* Adjusted alignment and leading */}
                                                                Latest
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <a
                                                        href={file.downloadUrl}
                                                        className="mt-1.5 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2.5 rounded text-xs transition-colors"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                                <div className="text-2xs text-gray-400 space-y-0.5 sm:space-y-0 sm:flex sm:space-x-3">
                                                    <span>
                                                        Version: {file.version}
                                                    </span>
                                                    <span>
                                                        Size: {file.fileSize}
                                                    </span>
                                                    <span>
                                                        Uploaded:{" "}
                                                        {formatDate(
                                                            file.uploadDate
                                                        )}
                                                    </span>
                                                </div>
                                                {file.changelog && (
                                                    <details className="mt-1.5 text-xs">
                                                        <summary className="cursor-pointer text-gray-300 hover:text-white text-2xs"> {/* text-2xs for consistency */}
                                                            View Changelog
                                                        </summary>
                                                        <div className="mt-1 p-1.5 bg-gray-600 rounded text-gray-300 whitespace-pre-wrap text-2xs"> {/* text-2xs for consistency */}
                                                            {file.changelog}
                                                        </div>
                                                    </details>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
