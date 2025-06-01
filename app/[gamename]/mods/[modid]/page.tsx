'use client';
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
        { id: "3", version: "1.1.0", fileName: "AwesomeMod_v1.1.0.zip", fileSize: "105 MB", uploadDate: new Date("2025-05-20T14:30:00Z"), downloadUrl: "#", changelog: "Fixed bugs, added new feature X.", isLatest: true },
        { id: "2", version: "1.0.1", fileName: "AwesomeMod_v1.0.1.zip", fileSize: "102 MB", uploadDate: new Date("2025-03-10T12:00:00Z"), downloadUrl: "#", changelog: "Minor bug fixes.", isLatest: false },
        { id: "1", version: "1.0.0", fileName: "AwesomeMod_v1.0.0.zip", fileSize: "100 MB", uploadDate: new Date("2025-01-15T10:00:00Z"), downloadUrl: "#", changelog: "Initial release.", isLatest: false },
    ],
    tags: ["Overhaul", "Graphics", "New Mechanics"],
};

export default function ModPage({ params }: { params: Promise<{ gamename: string; modid: string }> }) {
    const { gamename, modid } = use(params); // Unwrap params using use()
    // In a real app, you'd fetch data based on gamename and modid.
    // For now, we can use mockModData and potentially customize it or log the params.
    // console.log(`Displaying mod ${modid} for game ${gamename}`);
    const mod = { ...mockModData, title: `${mockModData.title} for ${gamename} (Mod ID: ${modid})` }; // Example of using params

    const [activeTab, setActiveTab] = useState<"description" | "files">("description");
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
            <header className="mb-6">
                <h1 className="text-4xl font-bold text-purple-400 mb-2">{mod.title}</h1>
                 <p className="text-sm text-gray-500">Game: {gamename}, Mod ID: {modid}</p>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                    <Image
                        src={mod.authorPFP}
                        alt={`${mod.author}'s profile picture`}
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                    />
                    <span>By {mod.author}</span>
                    <span className="mx-2">|</span>
                    <span>Category: <a href={`/categories/${mod.category.toLowerCase()}`} className="text-purple-300 hover:underline">{mod.category}</a></span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    {mod.allImageUrls && mod.allImageUrls.length > 0 && (
                        <div className="relative w-full h-96 mb-6 bg-gray-800 rounded-lg shadow-lg">
                            <Image
                                src={mod.allImageUrls[currentImageIndex]}
                                alt={`${mod.title} - image ${currentImageIndex + 1}`}
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg"
                                loading="lazy"
                            />
                            {mod.allImageUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                                        aria-label="Previous image"
                                    >
                                        &lt;
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                                        aria-label="Next image"
                                    >
                                        &gt;
                                    </button>
                                </>
                            )}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {mod.allImageUrls.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-3 h-3 rounded-full ${currentImageIndex === index ? 'bg-purple-500' : 'bg-gray-400'} hover:bg-purple-400 transition-colors`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="md:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg h-fit">
                    <h2 className="text-2xl font-semibold mb-3 text-purple-300">Mod Details</h2>
                    <div className="space-y-2 text-sm">
                        <p><strong>Uploaded:</strong> {formatDate(mod.uploaded)}</p>
                        <p><strong>Last Updated:</strong> {formatDate(mod.lastUpdated)}</p>
                        <p><strong>Likes:</strong> {mod.likes.toLocaleString()}</p>
                        <p><strong>Downloads:</strong> {mod.downloads.toLocaleString()}</p>
                        <p><strong>Size:</strong> {mod.size}</p>
                        {mod.tags && mod.tags.length > 0 && (
                            <div>
                                <strong>Tags:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {mod.tags.map(tag => (
                                        <span key={tag} className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {mod.fileVersions.find(f => f.isLatest) && (
                         <a
                            href={mod.fileVersions.find(f => f.isLatest)?.downloadUrl}
                            className="mt-4 block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center transition-colors"
                        >
                            Download Latest ({mod.fileVersions.find(f => f.isLatest)?.version})
                        </a>
                    )}
                </aside>

                <div className="md:col-span-3 mt-0">
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab("description")}
                                className={`${activeTab === "description" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab("files")}
                                className={`${activeTab === "files" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Files ({mod.fileVersions.length})
                            </button>
                        </nav>
                    </div>

                    <div>
                        {activeTab === "description" && (
                            <article className="prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none bg-gray-800 p-6 rounded-lg shadow">
                                <div dangerouslySetInnerHTML={{ __html: mod.fullDescription }} />
                            </article>
                        )}

                        {activeTab === "files" && (
                            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
                                <h2 className="text-xl font-semibold mb-4 text-purple-300">Available Files</h2>
                                <div className="space-y-4">
                                    {mod.fileVersions
                                        .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                                        .map((file) => (
                                        <div key={file.id} className={`p-4 rounded-md ${file.isLatest ? 'bg-gray-700 border-l-4 border-purple-500' : 'bg-gray-750'}`}>
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                                <h3 className="text-lg font-medium text-purple-400">{file.fileName} {file.isLatest && <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full ml-2">Latest</span>}</h3>
                                                <a
                                                    href={file.downloadUrl}
                                                    className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded text-sm transition-colors"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                            <div className="text-xs text-gray-400 space-y-0.5 sm:space-y-0 sm:flex sm:space-x-4">
                                                <span>Version: {file.version}</span>
                                                <span>Size: {file.fileSize}</span>
                                                <span>Uploaded: {formatDate(file.uploadDate)}</span>
                                            </div>
                                            {file.changelog && (
                                                <details className="mt-2 text-sm">
                                                    <summary className="cursor-pointer text-gray-300 hover:text-white">View Changelog</summary>
                                                    <div className="mt-1 p-2 bg-gray-600 rounded text-gray-300 whitespace-pre-wrap">
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