import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth";
import { userTable, games, categories, modStats } from "../../db/schema";
import ModManagement from "../components/ModManagement";
import AdminNavigation from "../components/AdminNavigation";
import { db } from "../../db";
import { mods } from "../../db/schema";
import { eq, desc, and, count, SQLWrapper } from "drizzle-orm";

export default async function AdminModsPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    const limit = 20;
    const offset = 0;
    const conditions: SQLWrapper[] = [];    const modsResult = await db
        .select({
            id: mods.id,
            title: mods.title,
            slug: mods.slug,
            description: mods.description,
            version: mods.version,
            imageUrl: mods.imageUrl,
            size: mods.size,
            isActive: mods.isActive,
            isFeatured: mods.isFeatured,
            createdAt: mods.createdAt,
            author: {
                id: userTable.id,
                username: userTable.username,
            },
            game: {
                id: games.id,
                name: games.name,
            },
            category: {
                id: categories.id,
                name: categories.name,
            },
            stats: {
                totalDownloads: modStats.totalDownloads,
                likes: modStats.likes,
                views: modStats.views,
                rating: modStats.rating,
            },
        })
        .from(mods)
        .leftJoin(userTable, eq(mods.authorId, userTable.id))
        .leftJoin(games, eq(mods.gameId, games.id))
        .leftJoin(categories, eq(mods.categoryId, categories.id))
        .leftJoin(modStats, eq(mods.id, modStats.modId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(mods.createdAt))
        .limit(limit)
        .offset(offset);

    const [{ count: total }] = await db
        .select({ count: count() })
        .from(mods)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

    const pagination = {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
    };

    const gamesList = await db
        .select({ id: games.id, name: games.name })
        .from(games);
    const categoriesList = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminNavigation />
                <ModManagement
                    initialMods={modsResult}
                    initialPagination={pagination}
                    games={gamesList}
                    categories={categoriesList}
                />
            </div>
        </div>
    );
}
