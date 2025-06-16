import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { collections, userTable, collectionMods, mods } from "@/app/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

function parseSize(sizeStr: string): number {
    if (!sizeStr || sizeStr === 'N/A') return 0;
    const match = sizeStr.match(/([\d.]+)\s*(B|KB|MB|GB)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    switch (unit) {
        case 'B': return value;
        case 'KB': return value * 1024;
        case 'MB': return value * 1024 * 1024;
        case 'GB': return value * 1024 * 1024 * 1024;
        default: return 0;
    }
}

function formatSize(bytes: number): string {
    if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const offset = (page - 1) * limit;

        // Get total count for pagination (only public collections)
        const totalCountResult = await db
            .select({ count: count() })
            .from(collections)
            .where(eq(collections.isPublic, true));

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);        // Get paginated public collections with mod count and user info
        const publicCollections = await db
            .select({
                id: collections.id,
                name: collections.name,
                description: collections.description,
                isPublic: collections.isPublic,
                likes: collections.likes,
                createdAt: collections.createdAt,
                updatedAt: collections.updatedAt,
                user: {
                    id: userTable.id,
                    username: userTable.username,
                    profilePicture: userTable.profilePicture,
                },
                modCount: sql<number>`(
                    SELECT COUNT(*)
                    FROM ${collectionMods}
                    WHERE ${collectionMods.collectionId} = ${collections.id}
                )`.as("mod_count"),
            })
            .from(collections)
            .leftJoin(userTable, eq(collections.userId, userTable.id))
            .where(eq(collections.isPublic, true))
            .orderBy(desc(collections.updatedAt))
            .limit(limit)
            .offset(offset);

        // For each collection, sum the mod sizes
        type CollectionWithTotalFileSize = typeof publicCollections[0] & { totalFileSize: string };
        const collectionsWithSize: CollectionWithTotalFileSize[] = [];
        for (const collection of publicCollections) {
            const modSizes = await db
                .select({ size: mods.size })
                .from(mods)
                .innerJoin(collectionMods, eq(mods.id, collectionMods.modId))
                .where(eq(collectionMods.collectionId, collection.id));
            const totalBytes = modSizes.reduce((sum, mod) => sum + parseSize(mod.size ?? ""), 0);
            collectionsWithSize.push({ ...collection, totalFileSize: formatSize(totalBytes) });
        }

        return NextResponse.json({
            collections: collectionsWithSize,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching collections:", error);
        return NextResponse.json(
            { error: "Failed to fetch collections" },
            { status: 500 }
        );
    }
}
