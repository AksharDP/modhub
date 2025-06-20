import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/logged-index";
import { mods, games, categories, modStats, userTable, images } from "@/app/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { withGetLogging } from "@/app/lib/api-logging";

async function getModsHandler(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCountResult = await db
        .select({ count: count() })
        .from(mods)
        .where(and(eq(mods.isActive, true)));

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get paginated mods with thumbnails
    const allMods = await db
        .select({
            id: mods.id,
            title: mods.title,
            slug: mods.slug,
            description: mods.description,
            version: mods.version,
            imageUrl: mods.imageUrl, // Fallback for backward compatibility
            thumbnailUrl: images.url,
            thumbnailAlt: images.alt,
            size: mods.size,
            isAdult: mods.isAdult,
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
        .leftJoin(images, eq(mods.thumbnailImageId, images.id))
        .where(and(eq(mods.isActive, true)))
        .orderBy(desc(mods.createdAt))
        .limit(limit)
        .offset(offset);

    return NextResponse.json({
        mods: allMods,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    });
}

export const GET = withGetLogging(getModsHandler);
