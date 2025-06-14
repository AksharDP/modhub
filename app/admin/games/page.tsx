import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth";
import GamesManagement from "../components/GamesManagement";
import AdminNavigation from "../components/AdminNavigation";
import { db } from "../../db";
import { games } from "../../db/schema";
import { desc } from "drizzle-orm";

export default async function AdminGamesPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    // SSR: Fetch initial games list
    const gamesList = await db
        .select({
            id: games.id,
            name: games.name,
            slug: games.slug,
            description: games.description,
            imageUrl: games.imageUrl,
            isActive: games.isActive,
            visibleToUsers: games.visibleToUsers,
            visibleToSupporters: games.visibleToSupporters,
            formSchema: games.formSchema,
            createdAt: games.createdAt,
            updatedAt: games.updatedAt,
        })
        .from(games)
        .orderBy(desc(games.name));
    const gamesListSerialized = gamesList.map((g) => ({
        ...g,
        createdAt: g.createdAt ? g.createdAt.toISOString() : null,
        updatedAt: g.updatedAt ? g.updatedAt.toISOString() : null,
    }));

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminNavigation />
                <GamesManagement initialGames={gamesListSerialized} />
            </div>
        </div>
    );
}
