import Image from "next/image";
import Link from "next/link";
import { db } from "@/app/db";
import { games, mods } from "@/app/db/schema";
import { eq, sql, asc } from "drizzle-orm";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function GamesPage() {
    try {
        const gamesData = await db
            .select({
                id: games.id,
                name: games.name,
                slug: games.slug,
                description: games.description,
                imageUrl: games.imageUrl,
                modCount: sql<number>`(
                    SELECT COUNT(*)
                    FROM ${mods}
                    WHERE ${mods.gameId} = ${games.id} AND ${mods.isActive} = true
                )`.as("mod_count"),
            })
            .from(games)
            .where(eq(games.isActive, true))
            .orderBy(asc(games.name));

        if (!gamesData || gamesData.length === 0) {
            return (
                <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                    <p className="text-xl text-gray-400">No games found.</p>
                </div>
            );
        }

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
                                            src={
                                                game.imageUrl ||
                                                "https://placehold.co/400x225/374151/FFFFFF/png?text=No+Image"
                                            }
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
                                        {game.description ||
                                            "No description available."}
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
    } catch {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                <p className="text-xl text-red-500">Failed to load games.</p>
            </div>
        );
    }
}
