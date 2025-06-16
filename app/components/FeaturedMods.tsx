import Card from "./card";
import DatabaseError from "./DatabaseError";
import { db } from "@/app/db";
import { mods, games, categories, modStats, userTable } from "@/app/db/schema";
import { desc, eq, and } from "drizzle-orm";

export default async function FeaturedMods() {
    try {
        const featuredMods = await db
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
            .orderBy(desc(modStats.rating))
            .limit(4);

        return (
            <div className="p-8 text-white">
                <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
                    Featured Mods
                </h1>
                <div className="flex flex-wrap justify-center">
                    {featuredMods?.map((mod) => (
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
                            size={mod.size || "N/A"}
                            uploaded={mod.createdAt || new Date()}
                            lastUpdated={mod.updatedAt || new Date()}
                        />
                    ))}
                </div>
            </div>
        );
    } catch {
        return <DatabaseError error="Failed to load featured mods." />;
    }
}
