import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { games, mods, modStats } from "@/app/db/schema";
import { eq, sql, asc, count, desc, and } from "drizzle-orm";
import { getCurrentSession, isAdmin } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fetchAll = searchParams.get("all") === "true";
        const forUpload = searchParams.get("forUpload") === "true";

        // Restrict ?all=true to admins only
        if (fetchAll) {
            const { user } = await getCurrentSession();
            if (!isAdmin(user)) {
                return NextResponse.json(
                    { error: "Unauthorized: Admin access required" },
                    { status: 403 }
                );
            }

            const allGames = await db
                .select({
                    id: games.id,
                    name: games.name,
                    slug: games.slug,
                    formSchema: games.formSchema,
                })
                .from(games)
                .where(eq(games.isActive, true))
                .orderBy(asc(games.name));
            return NextResponse.json({ games: allGames });
        }

        // Handle upload page request - only games visible to users
        if (forUpload) {
            const uploadGames = await db
                .select({
                    id: games.id,
                    name: games.name,
                    slug: games.slug,
                    formSchema: games.formSchema,
                })
                .from(games)
                .where(
                    and(
                        eq(games.isActive, true),
                        eq(games.visibleToUsers, true)
                    )
                )
                .orderBy(asc(games.name));
            return NextResponse.json({ games: uploadGames });
        }
        
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const offset = (page - 1) * limit;        // Get total count for pagination
        const totalCountResult = await db
            .select({ count: count() })
            .from(games)
            .where(
                and(
                    eq(games.isActive, true),
                    eq(games.visibleToUsers, true)
                )
            );

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        const gameStats = db
            .select({
                gameId: mods.gameId,
                modCount: count(mods.id).as("mod_count"),
                totalDownloads: sql<number>`sum(${modStats.totalDownloads})::int`.as("total_downloads"),
            })
            .from(mods)
            .leftJoin(modStats, eq(mods.id, modStats.modId))
            .where(eq(mods.isActive, true))
            .groupBy(mods.gameId)
            .as("game_stats");

        // Get paginated games
        const gamesData = await db
            .select({
                id: games.id,
                name: games.name,
                slug: games.slug,
                description: games.description,
                imageUrl: games.imageUrl,
                modCount: sql<number>`coalesce(${gameStats.modCount}, 0)`,
                totalDownloads: sql<number>`coalesce(${gameStats.totalDownloads}, 0)`,
            })
            .from(games)
            .leftJoin(gameStats, eq(games.id, gameStats.gameId))
            .where(
                and(
                    eq(games.isActive, true),
                    eq(games.visibleToUsers, true)
                )
            )
            .orderBy(desc(sql`coalesce(${gameStats.modCount}, 0)`), asc(games.name))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            games: gamesData,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching games:", error);
        return NextResponse.json(
            { error: "Failed to fetch games" },
            { status: 500 }
        );
    }
}
