"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Card from "@/app/components/card"; // Assuming @ points to the project root

interface Mod {
    modId: number;
    gameName: string;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    authorPFP: string;
    category: string;
    likes: number;
    downloads: number;
    size: string;
    uploaded: Date;
    lastUpdated: Date;
}

// Mock data - in a real app, this would be fetched from an API
// Ensure the author property matches the MOCK_AUTHOR_NAME for these to appear
const MOCK_AUTHOR_NAME = "ModderExtraordinaire"; // Example author name for mock data

const allModsDatabase: Mod[] = [
    {
        modId: 1,
        gameName: "Skyrim",
        title: "Enhanced Skyrim Weather",
        description: "Makes Skyrim weather more dynamic and immersive.",
        imageUrl: "/images/placeholders/skyrim_weather.jpg",
        author: MOCK_AUTHOR_NAME,
        authorPFP: "/images/placeholders/author_pfp.png",
        category: "Visuals",
        likes: 1250,
        downloads: 15000,
        size: "50MB",
        uploaded: new Date("2023-01-10"),
        lastUpdated: new Date("2023-05-20"),
    },
    {
        modId: 2,
        gameName: "Skyrim",
        title: "Legendary Creatures",
        description: "Adds new challenging creatures to the world of Skyrim.",
        imageUrl: "/images/placeholders/skyrim_creatures.jpg",
        author: MOCK_AUTHOR_NAME,
        authorPFP: "/images/placeholders/author_pfp.png",
        category: "Gameplay",
        likes: 980,
        downloads: 12000,
        size: "120MB",
        uploaded: new Date("2023-03-15"),
        lastUpdated: new Date("2023-06-01"),
    },
    {
        modId: 3,
        gameName: "Fallout 4",
        title: "Wasteland Overhaul",
        description:
            "A complete overhaul of Fallout 4's wasteland environment.",
        imageUrl: "/images/placeholders/fallout4_wasteland.jpg",
        author: MOCK_AUTHOR_NAME,
        authorPFP: "/images/placeholders/author_pfp.png",
        category: "Environment",
        likes: 2100,
        downloads: 25000,
        size: "250MB",
        uploaded: new Date("2022-11-05"),
        lastUpdated: new Date("2023-04-10"),
    },
    {
        modId: 4,
        gameName: "Stardew Valley",
        title: "Expanded Farm",
        description: "Increases the size of your farm and adds new areas.",
        imageUrl: "/images/placeholders/stardew_farm.jpg",
        author: MOCK_AUTHOR_NAME,
        authorPFP: "/images/placeholders/author_pfp.png",
        category: "Gameplay",
        likes: 750,
        downloads: 8000,
        size: "10MB",
        uploaded: new Date("2023-02-20"),
        lastUpdated: new Date("2023-02-25"),
    },
    {
        modId: 5,
        gameName: "Cyberpunk 2077",
        title: "Night City Realism",
        description: "Enhances NPC behavior and city dynamics.",
        imageUrl: "/images/placeholders/cyberpunk_city.jpg",
        author: MOCK_AUTHOR_NAME,
        authorPFP: "/images/placeholders/author_pfp.png",
        category: "Immersion",
        likes: 1500,
        downloads: 18000,
        size: "80MB",
        uploaded: new Date("2023-04-01"),
        lastUpdated: new Date("2023-07-15"),
    },
    // Add a mod by a different author to test filtering
    {
        modId: 6,
        gameName: "Skyrim",
        title: "Another Skyrim Mod",
        description: "A mod by a different author.",
        imageUrl: "/images/placeholders/skyrim_other.jpg",
        author: "AnotherAuthor",
        authorPFP: "/images/placeholders/another_author_pfp.png",
        category: "Items",
        likes: 50,
        downloads: 500,
        size: "5MB",
        uploaded: new Date("2023-08-01"),
        lastUpdated: new Date("2023-08-02"),
    },
];

export default function AuthorModsPage({
    params,
}: {
    params: Promise<{ author: string }>;
}) {
    const { author: authorNameEncoded } = use(params);
    const authorName = decodeURIComponent(authorNameEncoded);

    const [authorMods, setAuthorMods] = useState<Mod[]>([]);
    const [games, setGames] = useState<string[]>([]);
    const [selectedGame, setSelectedGame] = useState<string>("All Games");
    const [authorPFP, setAuthorPFP] = useState<string>(
        "/images/placeholders/default_pfp.png"
    );

    useEffect(() => {
        // Simulate fetching mods for the specific author
        const fetchedMods = allModsDatabase.filter(
            (mod) => mod.author === authorName
        );
        setAuthorMods(fetchedMods);

        if (fetchedMods.length > 0) {
            setAuthorPFP(fetchedMods[0].authorPFP); // Use PFP from the first mod
            const uniqueGames = Array.from(
                new Set(fetchedMods.map((mod) => mod.gameName))
            );
            setGames(["All Games", ...uniqueGames.sort()]);
        } else {
            setGames(["All Games"]);
            // Potentially fetch author details separately if PFP should be shown even with no mods
        }
        setSelectedGame("All Games"); // Reset filter when author changes
    }, [authorName]);

    const filteredMods =
        selectedGame === "All Games"
            ? authorMods
            : authorMods.filter((mod) => mod.gameName === selectedGame);

    return (
        <div className="container mx-auto p-4 sm:p-6 bg-gray-900 text-white min-h-screen max-w-7xl">
            <header className="mb-8 pt-4">
                <div className="flex flex-col items-center text-center">
                    <Image
                        src={authorPFP}
                        alt={`${authorName}'s profile picture`}
                        width={100}
                        height={100}
                        className="rounded-full mb-3 border-2 border-purple-500 object-cover"
                        onError={() =>
                            setAuthorPFP("/images/placeholders/default_pfp.png")
                        } // Fallback PFP
                    />
                    <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-1">
                        {authorName}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Viewing all mods by {authorName}
                    </p>
                </div>
            </header>

            {authorMods.length > 0 && (
                <div className="mb-6 flex justify-center sm:justify-start">
                    <div className="relative">
                        <label htmlFor="gameFilter" className="sr-only">
                            Filter mods by game
                        </label>
                        <select
                            id="gameFilter"
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value)}
                            className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {games.map((game) => (
                                <option key={game} value={game}>
                                    {game}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {filteredMods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredMods.map((mod) => (
                        <Card
                            key={`${mod.gameName}-${mod.modId}`} // Unique key for each card
                            modId={mod.modId}
                            gameName={mod.gameName}
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
                <div className="text-center py-10">
                    <p className="text-gray-400 text-xl">
                        {authorMods.length === 0
                            ? `${authorName} hasn't uploaded any mods yet.`
                            : `No mods found by ${authorName} for ${selectedGame}.`}
                    </p>
                </div>
            )}
        </div>
    );
}
