"use client";

import dynamic from "next/dynamic";
import NavBar from "./components/nav";
import PerformanceMonitor from "./components/PerformanceMonitor";
import DatabaseError from "./components/DatabaseError";
import { trpc } from "./lib/trpc";

type ModData = {
    id: number;
    title: string;
    slug: string;
    description: string;
    imageUrl: string | null;
    author: {
        id: number;
        username: string;
        profilePicture: string | null;
    } | null;
    game: {
        name: string;
        slug: string;
    } | null;
    category: {
        name: string;
        color: string | null;
    } | null;
    stats: {
        totalDownloads: number | null;
        likes: number | null;
        rating: number | null;
    } | null;
};

const Card = dynamic(() => import("./components/card"), {
    loading: () => (
        <div className="bg-gray-800 rounded-[var(--border-radius-custom)] shadow-lg m-2 w-80 h-[400px] flex items-center justify-center">
            <div className="animate-pulse">
                <div className="bg-gray-700 w-72 h-48 rounded mb-4"></div>
                <div className="bg-gray-700 h-4 w-48 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 w-32 rounded"></div>
            </div>
        </div>
    ),
    ssr: false,
});

export default function Home() {
    const {
        data: featuredMods,
        isLoading,
        error,
    } = trpc.mod.getFeaturedMods.useQuery({ limit: 4 });

    if (isLoading) {
        return (
            <>
                <NavBar />
                <main className="p-8 text-white">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <p className="mt-2 text-gray-400">
                            Loading featured mods...
                        </p>
                    </div>
                </main>
            </>
        );
    }
    if (error) {
        const isDatabaseError =
            error.message.includes("DATABASE_URI") ||
            error.message.includes("Failed query") ||
            error.message.includes("connection") ||
            error.message.includes("does not exist");

        if (isDatabaseError) {
            return <DatabaseError error={error.message} />;
        }

        return (
            <>
                <NavBar />
                <main className="p-8 text-white">
                    <div className="text-center text-red-400">
                        <p>Error loading featured mods: {error.message}</p>
                    </div>
                </main>
            </>
        );
    }
    return (
        <>
            <PerformanceMonitor pageName="Home" />
            <NavBar />
            <main>
                <div className="p-8 text-white">
                    <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
                        Featured Mods
                    </h1>{" "}
                    <div className="flex flex-wrap justify-center">
                        {featuredMods?.map((mod: ModData) => (
                            <Card
                                key={mod.id}
                                modId={mod.id}
                                gameName={mod.game?.slug || "unknown"}
                                title={mod.title}
                                description={mod.description}
                                imageUrl={
                                    mod.imageUrl ||
                                    "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod"
                                }
                                author={mod.author?.username || "Unknown"}
                                authorPFP={
                                    mod.author?.profilePicture ||
                                    "https://placehold.co/30x30/7C3AED/FFFFFF/png?text=U"
                                }
                                category={mod.category?.name || "Uncategorized"}
                                likes={mod.stats?.likes || 0}
                                downloads={mod.stats?.totalDownloads || 0}
                                size="N/A"
                                uploaded={new Date()}
                                lastUpdated={new Date()}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
