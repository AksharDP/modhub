"use client";

import Image from "next/image";

interface UserMod {
    id: number;
    title: string;
    description: string;
    version: string;
    imageUrl?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    isActive: boolean;
    isFeatured: boolean;
}

interface UserModsSectionProps {
    userMods: UserMod[];
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function UserModsSection({ userMods }: UserModsSectionProps) {
    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Your Mods</h2>
            {userMods.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.764m-4.764 4.764a15.995 15.995 0 014.764-4.764m0 0A15.995 15.995 0 0012 3.042a15.995 15.995 0 00-4.764 4.764m0 0a15.995 15.995 0 014.764-4.764"
                        />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Mods Yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        You haven&apos;t created any mods yet. Start sharing your creativity with the ModHub community!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userMods.map((mod) => (
                        <div
                            key={mod.id}
                            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors"
                        >
                            <div className="flex items-start space-x-3">
                                {mod.imageUrl && (
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={mod.imageUrl}
                                            alt={mod.title}
                                            width={64}
                                            height={64}
                                            className="rounded-lg object-cover"
                                            unoptimized={mod.imageUrl.startsWith("http")}
                                        />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-grow">
                                            <h3 className="text-lg font-semibold text-white truncate">{mod.title}</h3>
                                            <p className="text-sm text-gray-400 mb-2">v{mod.version}</p>
                                        </div>
                                        <div className="flex space-x-1 ml-2">
                                            {mod.isFeatured && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-600 text-yellow-100">Featured</span>
                                            )}
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                    mod.isActive
                                                        ? "bg-green-600 text-green-100"
                                                        : "bg-gray-600 text-gray-100"
                                                }`}
                                            >
                                                {mod.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">{mod.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>
                                            Created {formatDate(mod.createdAt !== null ? mod.createdAt : new Date())}
                                        </span>
                                        {mod.updatedAt !== mod.createdAt && (
                                            <span>
                                                Updated {formatDate(mod.updatedAt !== null ? mod.updatedAt : new Date())}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
