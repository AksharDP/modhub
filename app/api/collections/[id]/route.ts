import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { collections, collectionMods, mods, userTable, modStats, categories, games, images } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentSession, isAdmin } from "@/app/lib/auth";
import { getEntityImages } from "@/app/lib/mediaUtils";

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
        }        // Get collection with owner info and thumbnail
        const [collection] = await db
            .select({
                id: collections.id,
                name: collections.name,
                description: collections.description,
                imageUrl: collections.imageUrl, // Fallback for backward compatibility
                thumbnailImageId: collections.thumbnailImageId,
                thumbnailUrl: images.url,
                thumbnailAlt: images.alt,
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
            .leftJoin(images, eq(collections.thumbnailImageId, images.id))
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
        }        // Get mods in the collection with thumbnails
        const collectionModsData = await db
            .select({
                mod: {
                    id: mods.id,
                    title: mods.title,
                    description: mods.description,
                    imageUrl: mods.imageUrl, // Fallback for backward compatibility
                    thumbnailUrl: images.url,
                    thumbnailAlt: images.alt,
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
            .leftJoin(images, eq(mods.thumbnailImageId, images.id))
            .where(eq(collectionMods.collectionId, collectionId))
            .orderBy(collectionMods.order, desc(collectionMods.addedAt));

        // Get collection images
        const collectionImages = await getEntityImages('collection', collectionId);

        return NextResponse.json({
            collection: {
                ...collection,
                images: collectionImages
            },
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
