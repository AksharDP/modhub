import React from "react";
import { FileVersionInterface } from "@/app/types/common";

const UploadIcon = () => (
    <svg
        className="w-4 h-4 mr-2 text-gray-500"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
    </svg>
);
const UpdateIcon = () => (
    <svg
        className="w-4 h-4 mr-2 text-gray-500"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2M15 15h-5.418"></path>
    </svg>
);
const LikesIcon = () => (
    <svg
        className="w-4 h-4 mr-2 text-gray-500"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
    </svg>
);
const DownloadsIcon = () => (
    <svg
        className="w-4 h-4 mr-2 text-gray-500"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
);
const SizeIcon = () => (
    <svg
        className="w-4 h-4 mr-2 text-gray-500"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
    </svg>
);
const TagIcon = () => (
    <svg
        className="w-4 h-4 mr-1 text-gray-500"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3z"></path>    </svg>
);

interface ModDetailsSidebarProps {
    mod: {
        uploaded: string | number | Date;
        lastUpdated: string | number | Date;
        likes: number;
        downloads: number;
        size: string;
        tags?: string[];
        fileVersions: FileVersionInterface[];
    };
    formatDate: (date: string | number | Date) => string;
}

const ModDetailsSidebar: React.FC<ModDetailsSidebarProps> = ({
    mod,
    formatDate,
}) => {
    return (
        <>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
                Mod Details
            </h2>
            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                        <UploadIcon />
                        Uploaded:
                    </span>
                    <span className="text-gray-200 font-medium">
                        {formatDate(mod.uploaded)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                        <UpdateIcon />
                        Last Updated:
                    </span>
                    <span className="text-gray-200 font-medium">
                        {formatDate(mod.lastUpdated)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                        <LikesIcon />
                        Likes:
                    </span>
                    <span className="text-gray-200 font-medium">
                        {mod.likes.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                        <DownloadsIcon />
                        Downloads:
                    </span>
                    <span className="text-gray-200 font-medium">
                        {mod.downloads.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                        <SizeIcon />
                        Size:
                    </span>
                    <span className="text-gray-200 font-medium">
                        {mod.size}
                    </span>
                </div>

                {mod.tags && mod.tags.length > 0 && (
                    <div className="pt-1">
                        <span className="text-gray-400 flex items-center mb-1">
                            <TagIcon />
                            Tags:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {mod.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-700 text-xs px-2 py-1 rounded-[5px] hover:bg-gray-600 transition-colors cursor-default"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>                )}
            </div>
        </>
    );
};

export default ModDetailsSidebar;
