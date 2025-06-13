"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@/app/components/card";
import { ModInterface } from "@/app/types/common";

const allModsDatabase: ModInterface[] = [
    {
        modId: 1,
        game: { id: 1, name: "Skyrim", slug: "skyrim" },
        title: "Enhanced Skyrim Weather",
        description:
            "Makes Skyrim weather more dynamic and immersive. Realistic storms.",
        imageUrl:
            "https://placehold.co/300x200/1ABC9C/FFFFFF/png?text=SkyrimWeather",
        author: "WeatherMage",
        authorPFP: "https://placehold.co/30x30/1ABC9C/FFFFFF/png",
        category: "Visuals",
        likes: 1250,
        downloads: 15000,
        size: "50MB",
        uploaded: new Date("2023-01-10"),
        lastUpdated: new Date("2023-05-20"),
    },
    {
        modId: 2,
        game: { id: 1, name: "Skyrim", slug: "skyrim" },
        title: "Legendary Creatures",
        description:
            "Adds new challenging creatures to the world of Skyrim. Beware the dragons!",
        imageUrl:
            "https://placehold.co/300x200/E74C3C/FFFFFF/png?text=SkyrimCreatures",
        author: "CreatureCrafter",
        authorPFP: "https://placehold.co/30x30/E74C3C/FFFFFF/png",
        category: "Gameplay",
        likes: 980,
        downloads: 12000,
        size: "120MB",
        uploaded: new Date("2023-03-15"),
        lastUpdated: new Date("2023-06-01"),
    },
    {
        modId: 3,
        game: { id: 2, name: "Fallout 4", slug: "fallout4" },
        title: "Wasteland Overhaul",
        description:
            "A complete overhaul of Fallout 4's wasteland environment. More realistic and gritty.",
        imageUrl:
            "https://placehold.co/300x200/F39C12/FFFFFF/png?text=FalloutWasteland",
        author: "WastelandWizard",
        authorPFP: "https://placehold.co/30x30/F39C12/FFFFFF/png",
        category: "Environment",
        likes: 2100,
        downloads: 25000,
        size: "250MB",
        uploaded: new Date("2022-11-05"),
        lastUpdated: new Date("2023-04-10"),
    },
    {
        modId: 4,
        game: { id: 3, name: "Stardew Valley", slug: "stardewvalley" },
        title: "Expanded Farm Deluxe",
        description:
            "Increases the size of your farm and adds new areas for cultivation. Deluxe version.",
        imageUrl:
            "https://placehold.co/300x200/2ECC71/FFFFFF/png?text=StardewFarm",
        author: "FarmerJohn",
        authorPFP: "https://placehold.co/30x30/2ECC71/FFFFFF/png",
        category: "Gameplay",
        likes: 750,
        downloads: 8000,
        size: "10MB",
        uploaded: new Date("2023-02-20"),
        lastUpdated: new Date("2023-02-25"),
    },
    {
        modId: 5,
        game: { id: 4, name: "Cyberpunk 2077", slug: "cyberpunk2077" },
        title: "Night City Realism",
        description:
            "Enhances NPC behavior and city dynamics for a more immersive Cyberpunk experience.",
        imageUrl:
            "https://placehold.co/300x200/9B59B6/FFFFFF/png?text=CyberpunkRealism",
        author: "CyberGuru",
        authorPFP: "https://placehold.co/30x30/9B59B6/FFFFFF/png",
        category: "Immersion",
        likes: 1500,
        downloads: 18000,
        size: "80MB",
        uploaded: new Date("2023-04-01"),
        lastUpdated: new Date("2023-07-15"),
    },
    {
        modId: 6,
        game: { id: 5, name: "Minecraft", slug: "minecraft" },
        title: "Ultimate Shaders Pack",
        description:
            "Brings stunning visual fidelity to Minecraft with realistic lighting and water.",
        imageUrl:
            "https://placehold.co/300x200/3498DB/FFFFFF/png?text=MinecraftShaders",
        author: "ShaderSensei",
        authorPFP: "https://placehold.co/30x30/3498DB/FFFFFF/png",
        category: "Visuals",
        likes: 3000,
        downloads: 50000,
        size: "5MB",
        uploaded: new Date("2023-06-10"),
        lastUpdated: new Date("2023-08-01"),
    },
    {
        modId: 7,
        game: { id: 1, name: "Skyrim", slug: "skyrim" },
        title: "Immersive Weapons",
        description:
            "Adds hundreds of new lore-friendly weapons to Skyrim. For a true warrior.",
        imageUrl:
            "https://placehold.co/300x200/E67E22/FFFFFF/png?text=SkyrimWeapons",
        author: "BladeMaster",
        authorPFP: "https://placehold.co/30x30/E67E22/FFFFFF/png",
        category: "Items",
        likes: 1800,
        downloads: 22000,
        size: "150MB",
        uploaded: new Date("2022-12-01"),
        lastUpdated: new Date("2023-07-22"),
    },
];

const SearchIcon = () => (
    <svg
        className="w-5 h-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
        />
    </svg>
);

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGame, setSelectedGame] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("relevance");
    const [displayedMods, setDisplayedMods] = useState<ModInterface[]>([]);

    const availableGames = useMemo(() => {
        const games = new Set(allModsDatabase.map((mod) => mod.game?.name || "Unknown Game"));
        return ["All", ...Array.from(games).sort()];
    }, []);

    const availableCategories = useMemo(() => {
        const categories = new Set(
            allModsDatabase.flatMap((mod) =>
                Array.isArray(mod.category) ? mod.category : [mod.category]
            )
        );
        return ["All", ...Array.from(categories).sort()];
    }, []);

    useEffect(() => {
        let filtered = allModsDatabase;

        if (searchTerm.trim() !== "") {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (mod) =>
                    mod.title.toLowerCase().includes(lowerSearchTerm) ||
                    mod.description.toLowerCase().includes(lowerSearchTerm) ||
                    mod.author.toLowerCase().includes(lowerSearchTerm)
            );
        }

        if (selectedGame !== "All") {
            filtered = filtered.filter((mod) => mod.game?.name === selectedGame);
        }

        if (selectedCategory !== "All") {
            filtered = filtered.filter(
                (mod) => mod.category === selectedCategory
            );
        }

        switch (sortBy) {
            case "likes":
                filtered.sort((a, b) => b.likes - a.likes);
                break;
            case "downloads":
                filtered.sort((a, b) => b.downloads - a.downloads);
                break;
            case "newest":
                filtered.sort(
                    (a, b) =>
                        new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime()
                );
                break;
            case "lastUpdated":
                filtered.sort(
                    (a, b) =>
                        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                );
                break;
            case "relevance":
            default:
                if (searchTerm.trim() !== "") {
                    const lowerSearchTerm = searchTerm.toLowerCase();
                    filtered.sort((a, b) => {
                        const aTitleMatch = a.title
                            .toLowerCase()
                            .includes(lowerSearchTerm);
                        const bTitleMatch = b.title
                            .toLowerCase()
                            .includes(lowerSearchTerm);
                        if (aTitleMatch && !bTitleMatch) return -1;
                        if (!aTitleMatch && bTitleMatch) return 1;
                        return 0;
                    });
                }
                break;
        }

        setDisplayedMods(filtered);
    }, [searchTerm, selectedGame, selectedCategory, sortBy]);
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Search Mods
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Find your next favorite mod.
                    </p>
                </header>

                <div className="mb-6 p-4 bg-gray-800 rounded-[5px] shadow-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="search"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Search Term
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search by title, description, author..."
                                    className="w-full bg-gray-700 text-white border-gray-600 rounded-[5px] py-2.5 pl-10 pr-3 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="gameFilter"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Game
                            </label>
                            <select
                                id="gameFilter"
                                value={selectedGame}
                                onChange={(e) =>
                                    setSelectedGame(e.target.value)
                                }
                                className="w-full bg-gray-700 text-white border-gray-600 rounded-[5px] py-2.5 px-3 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                            >
                                {availableGames.map((game) => (
                                    <option key={game} value={game}>
                                        {game}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="categoryFilter"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Category
                            </label>
                            <select
                                id="categoryFilter"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-gray-700 text-white border-gray-600 rounded-[5px] py-2.5 px-3 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                            >
                                {availableCategories.map((category) => (
                                    <option key={String(category)} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="sortBy"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Sort By
                            </label>
                            <select
                                id="sortBy"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-gray-700 text-white border-gray-600 rounded-[5px] py-2.5 px-3 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="likes">Likes</option>
                                <option value="downloads">Downloads</option>
                                <option value="newest">Newest</option>
                                <option value="lastUpdated">
                                    Last Updated
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {displayedMods.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {displayedMods.map((mod) => (
                            <Card
                                key={mod.modId}
                                modId={mod.modId}
                                gameName={mod.game?.name || "Unknown Game"} // Updated to use game object
                                title={mod.title}
                                description={mod.description}
                                imageUrl={mod.imageUrl}
                                author={mod.author}
                                authorPFP={mod.authorPFP}
                                category={mod.category}
                                likes={mod.likes}
                                downloads={mod.downloads}
                                size={mod.size}
                                uploaded={mod.uploaded}
                                lastUpdated={mod.lastUpdated}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 mt-10 py-16 bg-gray-800 rounded-xl shadow-lg">
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
                            <path
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                            No Mods Found
                        </h2>
                        <p className="text-gray-400 text-lg max-w-md mx-auto">
                            Try adjusting your search term or filters to find
                            what you&apos;re looking for.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
