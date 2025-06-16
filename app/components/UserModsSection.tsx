"use client";

import Card from "./card";

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

export default function UserModsSection({ userMods }: UserModsSectionProps) {
    // Map userMods to CardProps, using placeholders/defaults for missing fields
    const cards = userMods.map((mod) => {
        return {
            modId: mod.id,
            gameName: "", // Not available, so leave blank or fetch if needed
            slug: undefined, // Not available
            title: mod.title,
            description: mod.description,
            imageUrl: mod.imageUrl || "/placeholder1.svg",
            author: "You",
            authorPFP: "/placeholder1.svg",
            category: "", // Not available
            likes: 0, // Not available
            downloads: 0, // Not available
            size: "-", // Not available
            uploaded: mod.createdAt,
            lastUpdated: mod.updatedAt,
        };
    });
    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Your Mods</h2>
            {cards.length === 0 ? (
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
                <div className="flex flex-wrap gap-4 justify-start">
                    {cards.map((card) => (
                        <Card key={card.modId} {...card} />
                    ))}
                </div>
            )}
        </div>
    );
}
