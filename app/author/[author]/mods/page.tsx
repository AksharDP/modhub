"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Card from "@/app/components/card";

export interface Mod {
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

const MOCK_AUTHOR_NAME = "ModderExtraordinaire";

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

const DEFAULT_PFP = "https://placehold.co/128x128/7C3AED/FFFFFF/png?text=PFP";

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
    const [authorPFP, setAuthorPFP] = useState<string>(DEFAULT_PFP);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchedMods = allModsDatabase.filter(
                (mod) => mod.author === authorName
            );
            setAuthorMods(fetchedMods);

            if (fetchedMods.length > 0) {
                setAuthorPFP(fetchedMods[0].authorPFP || DEFAULT_PFP);
                const uniqueGames = Array.from(
                    new Set(fetchedMods.map((mod) => mod.gameName))
                );
                setGames(["All Games", ...uniqueGames.sort()]);
            } else {
                setAuthorPFP(DEFAULT_PFP);
                setGames(["All Games"]);
            }
            setSelectedGame("All Games");
        }, 500);

        return () => clearTimeout(timer);
    }, [authorName]);

    const filteredMods =
        selectedGame === "All Games"
            ? authorMods
            : authorMods.filter((mod) => mod.gameName === selectedGame);

    return (
        <div className="bg-gray-900 text-white min-h-screen w-full">
            <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                
                <header className="mb-10 p-6 bg-gray-800 rounded-[5px] shadow-xl flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
                    <Image
                        src={authorPFP}
                        alt={`${authorName}'s profile picture`}
                        width={128}
                        height={128}
                        className="rounded-[5px] border-4 border-purple-500 object-cover flex-shrink-0 shadow-md"
                        onError={() => setAuthorPFP(DEFAULT_PFP)}
                    />
                    <div className="flex-grow mt-4 sm:mt-0">
                        <h1 className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">
                            {authorName}
                        </h1>
                        <p className="text-gray-400 text-md mb-3">
                            Showcasing all mods by {authorName}.
                        </p>
                        {authorMods.length > 0 && (
                             <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-300">{authorMods.length}</span> Mod{authorMods.length === 1 ? '' : 's'} Published
                            </div>
                        )}
                    </div>
                </header>

                {authorMods.length > 0 && games.length > 1 && (
                    <div className="mb-8 flex justify-center sm:justify-start">
                        <div className="relative">
                            <label htmlFor="gameFilter" className="sr-only">
                                Filter mods by game
                            </label>
                            <select
                                id="gameFilter"
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600 rounded-lg py-2.5 px-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base shadow-sm"
                            >
                                {games.map((game) => (
                                    <option key={game} value={game}>
                                        {game}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {filteredMods.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMods.map((mod) => (
                            <Card
                                key={`${mod.gameName}-${mod.modId}`}
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
                    <div className="text-center py-16 bg-gray-800 rounded-xl shadow-lg">
                        <svg className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.764m-4.764 4.764a15.995 15.995 0 014.764-4.764m0 0A15.995 15.995 0 0012 3.042a15.995 15.995 0 00-4.764 4.764m0 0a15.995 15.995 0 014.764-4.764" />
                             <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                            {authorMods.length === 0
                                ? "No Mods Yet"
                                : "No Mods Found"}
                        </h2>
                        <p className="text-gray-400 text-lg max-w-md mx-auto">
                            {authorMods.length === 0
                                ? `${authorName} hasn't uploaded any mods yet. Check back later!`
                                : `We couldn't find any mods by ${authorName} for "${selectedGame}". Try selecting "All Games" or a different game.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
