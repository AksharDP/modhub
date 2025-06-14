import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth";
import StatsOverview from "../components/StatsOverview";
import AdminNavigation from "../components/AdminNavigation";
import { db } from "../../db";
import { userTable, mods, games, categories, modStats } from "../../db/schema";
import { count, eq, sum } from "drizzle-orm";

export default async function AdminOverviewPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    // SSR: Fetch dashboard stats
    const [{ users }] = await db
        .select({ users: count() })
        .from(userTable);

    const [{ mods: totalMods }] = await db
        .select({ mods: count() })
        .from(mods);

    const [{ activeMods }] = await db
        .select({ activeMods: count() })
        .from(mods)
        .where(eq(mods.isActive, true));

    const [{ featuredMods }] = await db
        .select({ featuredMods: count() })
        .from(mods)
        .where(eq(mods.isFeatured, true));

    const [{ games: totalGames }] = await db
        .select({ games: count() })
        .from(games);

    const [{ categories: totalCategories }] = await db
        .select({ categories: count() })
        .from(categories);

    const [{ totalDownloads }] = await db
        .select({ totalDownloads: sum(modStats.totalDownloads) })
        .from(modStats);

    const stats = {
        users: Number(users),
        mods: Number(totalMods),
        activeMods: Number(activeMods),
        featuredMods: Number(featuredMods),
        games: Number(totalGames),
        categories: Number(totalCategories),
        totalDownloads: Number(totalDownloads),
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminNavigation />
                <StatsOverview initialStats={stats} />
            </div>
        </div>
    );
}
