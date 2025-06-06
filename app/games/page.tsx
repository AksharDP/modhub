"use client";

import Image from "next/image";
import Link from "next/link";

interface Game {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    modCount: number;
    description: string;
}

const gamesData: Game[] = [
    {
        id: "1",
        name: "Cyberpunk 2077",
        slug: "cyberpunk-2077",
        imageUrl:
            "https://placehold.co/400x225/7C3AED/FFFFFF/png?text=Cyberpunk+2077",
        modCount: 123,
        description: "An open-world, action-adventure story set in Night City.",
    },
    {
        id: "4",
        name: "Fallout 4",
        slug: "fallout-4",
        imageUrl:
            "https://placehold.co/400x225/16A34A/FFFFFF/png?text=Fallout+4",
        modCount: 1011,
        description:
            "Enter the Wasteland in the ambitious open-world game from Bethesda Game Studios.",
    },
    {
        id: "6",
        name: "Minecraft",
        slug: "minecraft",
        imageUrl:
            "https://placehold.co/400x225/059669/FFFFFF/png?text=Minecraft",
        modCount: 5000,
        description: "A game about placing blocks and going on adventures.",
    },
    {
        id: "3",
        name: "Skyrim Special Edition",
        slug: "skyrim-se",
        imageUrl:
            "https://placehold.co/400x225/1D4ED8/FFFFFF/png?text=Skyrim+SE",
        modCount: 789,
        description: "The epic fantasy masterpiece from Bethesda Game Studios.",
    },
    {
        id: "5",
        name: "Stardew Valley",
        slug: "stardew-valley",
        imageUrl:
            "https://placehold.co/400x225/F59E0B/FFFFFF/png?text=Stardew+Valley",
        modCount: 1213,
        description: "Create the farm of your dreams in this country-life RPG.",
    },
    {
        id: "2",
        name: "The Witcher 3: Wild Hunt",
        slug: "the-witcher-3",
        imageUrl:
            "https://placehold.co/400x225/DC2626/FFFFFF/png?text=Witcher+3",
        modCount: 456,
        description:
            "A story-driven, open world RPG set in a visually stunning fantasy universe.",
    },
].sort((a, b) => a.name.localeCompare(b.name));

export default function GamesPage() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Browse Games
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Discover mods for your favorite games.
                    </p>
                </header>

                <div className="flex flex-wrap justify-center">
                    {gamesData.map((game) => (
                        <div
                            key={game.id}
                            className="bg-gray-800 rounded-[var(--border-radius-card)] shadow-xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col m-2 w-80"
                        >
                            <Link href={`/games/${game.slug}`}>
                                <div className="relative w-full h-48 cursor-pointer">
                                    <Image
                                        src={game.imageUrl}
                                        alt={game.name}
                                        fill
                                        className="transition-transform duration-300 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300"></div>
                                </div>
                            </Link>
                            <div className="p-5 flex flex-col flex-grow">
                                <Link href={`/games/${game.slug}`}>
                                    <h2 className="text-xl font-semibold text-white transition-colors duration-300 mb-1 truncate hover:text-purple-400 cursor-pointer">
                                        {game.name}
                                    </h2>
                                </Link>
                                <p className="text-gray-400 text-sm mb-3 flex-grow h-16 overflow-hidden">
                                    {game.description}
                                </p>
                                <div className="mt-auto">
                                    <span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full transition-colors duration-300">
                                        {game.modCount.toLocaleString()} Mods
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
