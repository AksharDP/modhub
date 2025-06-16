import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { games, mods } from "@/app/db/schema";
import { eq, sql, asc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const totalCountResult = await db
            .select({ count: count() })
            .from(games)
            .where(eq(games.isActive, true));

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // Get paginated games
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
            .orderBy(asc(games.name))
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
        console.error("Error fetching paginated games:", error);
        return NextResponse.json(
            { error: "Failed to fetch games" },
            { status: 500 }
        );
    }
}
