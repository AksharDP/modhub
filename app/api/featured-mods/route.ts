import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { mods, games, categories, modStats, userTable } from "@/app/db/schema";
import { desc, eq, and, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "8");
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const totalCountResult = await db
            .select({ count: count() })
            .from(mods)
            .where(and(eq(mods.isActive, true)));

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // Get paginated mods
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
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            mods: featuredMods,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching paginated mods:", error);
        return NextResponse.json(
            { error: "Failed to fetch mods" },
            { status: 500 }
        );
    }
}
