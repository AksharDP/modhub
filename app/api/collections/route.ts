import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { collections, userTable, collectionMods, mods } from "@/app/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

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
        const totalPages = Math.ceil(totalCount / limit);        // Get paginated public collections with mod count, likes, total file size and user info
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
                )`.as("mod_count"),                totalFileSize: sql<string>`(
                    SELECT COALESCE(
                        CASE
                            WHEN COUNT(*) = 0 THEN 'N/A'
                            ELSE 'Multiple files'
                        END,
                        'N/A'
                    )
                    FROM ${collectionMods}
                    LEFT JOIN ${mods} ON ${collectionMods.modId} = ${mods.id}
                    WHERE ${collectionMods.collectionId} = ${collections.id}
                        AND ${mods}.size IS NOT NULL 
                        AND ${mods}.size != 'N/A'
                )`.as("total_file_size"),
            })
            .from(collections)
            .leftJoin(userTable, eq(collections.userId, userTable.id))
            .where(eq(collections.isPublic, true))
            .orderBy(desc(collections.updatedAt))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            collections: publicCollections,
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
