import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { collections, collectionMods, mods, userTable, modStats, categories, games } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentSession, isAdmin } from "@/app/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const collectionId = parseInt(id);
        
        if (isNaN(collectionId)) {
            return NextResponse.json(
                { error: "Invalid collection ID" },
                { status: 400 }
            );
        }

        // Get collection with owner info
        const [collection] = await db
            .select({
                id: collections.id,
                name: collections.name,
                description: collections.description,
                isPublic: collections.isPublic,
                createdAt: collections.createdAt,
                updatedAt: collections.updatedAt,
                user: {
                    id: userTable.id,
                    username: userTable.username,
                    profilePicture: userTable.profilePicture,
                    role: userTable.role,
                },
            })
            .from(collections)
            .leftJoin(userTable, eq(collections.userId, userTable.id))
            .where(eq(collections.id, collectionId))
            .limit(1);

        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            );
        }

        // If collection is private, only allow owner or admin to view
        if (!collection.isPublic) {
            const { user } = await getCurrentSession();
            if (!user || !collection.user || (user.id !== collection.user.id && !isAdmin(user))) {
                return NextResponse.json(
                    { error: "Collection not found" },
                    { status: 404 }
                );
            }
        }        // Get mods in the collection
        const collectionModsData = await db
            .select({
                mod: {
                    id: mods.id,
                    title: mods.title,
                    description: mods.description,
                    imageUrl: mods.imageUrl,
                    version: mods.version,
                    size: mods.size,
                    createdAt: mods.createdAt,
                    updatedAt: mods.updatedAt,
                    gameId: mods.gameId,
                    authorId: mods.authorId,
                    categoryId: mods.categoryId,
                },
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
                    likes: modStats.likes,
                    totalDownloads: modStats.totalDownloads,
                    views: modStats.views,
                    rating: modStats.rating,
                    ratingCount: modStats.ratingCount,
                },
                addedAt: collectionMods.addedAt,
                order: collectionMods.order,
            })
            .from(collectionMods)
            .innerJoin(mods, eq(collectionMods.modId, mods.id))
            .leftJoin(userTable, eq(mods.authorId, userTable.id))
            .leftJoin(games, eq(mods.gameId, games.id))
            .leftJoin(categories, eq(mods.categoryId, categories.id))
            .leftJoin(modStats, eq(mods.id, modStats.modId))
            .where(eq(collectionMods.collectionId, collectionId))
            .orderBy(collectionMods.order, desc(collectionMods.addedAt));

        return NextResponse.json({
            collection,
            mods: collectionModsData,
        });
        
    } catch (error) {
        console.error("Error fetching collection:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
