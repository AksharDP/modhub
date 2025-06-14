import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth";
import { db } from "../../../db";
import { mods, userTable, games, categories, modStats } from "../../../db/schema";
import { eq, desc, and, count, SQLWrapper, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const { user } = await getCurrentSession();
    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { limit = 20, offset = 0, isActive, isFeatured, search } = body;
    const conditions: SQLWrapper[] = [];
    if (isActive !== undefined) {
        conditions.push(eq(mods.isActive, isActive));
    }
    if (isFeatured !== undefined) {
        conditions.push(eq(mods.isFeatured, isFeatured));
    }
    if (search) {
        conditions.push(
            sql`(${mods.title} ILIKE ${`%${search}%`} OR ${mods.description} ILIKE ${`%${search}%`})`
        );
    }
    const modsResult = await db
        .select({
            id: mods.id,
            title: mods.title,
            slug: mods.slug,
            description: mods.description,
            version: mods.version,
            imageUrl: mods.imageUrl,
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
    const res = NextResponse.json({ mods: modsResult, pagination });
    // Add cache headers to reduce edge requests for identical queries
    res.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    return res;
}
