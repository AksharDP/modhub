import Card from "@/app/components/card";
import DatabaseError from "@/app/components/DatabaseError";
import { db } from "@/app/db";
import { mods, games, categories, modStats, userTable } from "@/app/db/schema";
import { desc, eq, and } from "drizzle-orm";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ModsPage() {
    try {
        const data = await db
            .select({
                id: mods.id,
                title: mods.title,
                slug: mods.slug,
                description: mods.description,
                version: mods.version,
                imageUrl: mods.imageUrl,
                size: mods.size,
                createdAt: mods.createdAt,
                updatedAt: mods.updatedAt,
                author: {
                    id: userTable.id,
                    username: userTable.username,
                    profilePicture: userTable.profilePicture,
                },
                game: {
                    id: games.id,
                    name: games.name,
                    slug: games.slug,
                },
                category: {
                    id: categories.id,
                    name: categories.name,
                    slug: categories.slug,
                    color: categories.color,
                },
                stats: {
                    totalDownloads: modStats.totalDownloads,
                    likes: modStats.likes,
                    rating: modStats.rating,
                    ratingCount: modStats.ratingCount,
                },
            })
            .from(mods)
            .leftJoin(userTable, eq(mods.authorId, userTable.id))
            .leftJoin(games, eq(mods.gameId, games.id))
            .leftJoin(categories, eq(mods.categoryId, categories.id))
            .leftJoin(modStats, eq(mods.id, modStats.modId))
            .where(and(eq(mods.isActive, true)))
            .orderBy(desc(mods.createdAt))
            .limit(20);

        return (
            <div className="bg-gray-900 min-h-screen flex flex-col">
                <main className="flex-grow container mx-auto px-4 py-8">
                    <header className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-purple-400">
                            Recent Mods
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Explore the latest additions to our modding community.
                        </p>
                    </header>
                    {data && data.length > 0 ? (
                        <div className="flex flex-wrap justify-center">
                            {data.map((mod) => (
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
                                    category={mod.category?.name || "Other"}
                                    likes={mod.stats?.likes || 0}
                                    downloads={mod.stats?.totalDownloads || 0}
                                    size={mod.size || "N/A"}
                                    uploaded={mod.createdAt || ""}
                                    lastUpdated={mod.updatedAt || ""}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 mt-10">
                            <p className="text-2xl">No mods found.</p>
                            <p>Check back later for new additions!</p>
                        </div>
                    )}
                </main>
            </div>
        );
    } catch (error: unknown) {
        let message = "Failed to load mods.";
        if (error instanceof Error) message = error.message;
        return <DatabaseError error={message} />;
    }
}
