import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { db } from "../../../../db";
import { mods, userTable, games, categories, modStats } from "../../../../db/schema";
import { eq } from "drizzle-orm";

// GET individual mod for admin
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await getCurrentSession();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const modId = parseInt(id);
        
        if (isNaN(modId)) {
            return NextResponse.json({ error: "Invalid mod ID" }, { status: 400 });
        }

        const modData = await db
            .select({
                id: mods.id,
                title: mods.title,
                slug: mods.slug,
                description: mods.description,
                version: mods.version,
                imageUrl: mods.imageUrl,
                downloadUrl: mods.downloadUrl,
                size: mods.size,
                isActive: mods.isActive,
                isFeatured: mods.isFeatured,
                isAdult: mods.isAdult,
                gameId: mods.gameId,
                categoryId: mods.categoryId,
                authorId: mods.authorId,
                createdAt: mods.createdAt,
                updatedAt: mods.updatedAt,
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
            .where(eq(mods.id, modId))
            .limit(1);

        if (!modData || modData.length === 0) {
            return NextResponse.json({ error: "Mod not found" }, { status: 404 });
        }

        return NextResponse.json(modData[0]);
    } catch (error) {
        console.error("Error fetching mod for admin:", error);
        return NextResponse.json(
            { error: "Failed to fetch mod" },
            { status: 500 }
        );
    }
}

// UPDATE mod (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await getCurrentSession();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const modId = parseInt(id);
        
        if (isNaN(modId)) {
            return NextResponse.json({ error: "Invalid mod ID" }, { status: 400 });
        }

        const body = await request.json();
        const {
            title,
            description,
            version,
            imageUrl,
            downloadUrl,
            size,
            gameId,
            categoryId,
        } = body;        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (version !== undefined) updateData.version = version;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (downloadUrl !== undefined) updateData.downloadUrl = downloadUrl;
        if (size !== undefined) updateData.size = size;
        if (gameId !== undefined) updateData.gameId = gameId;
        if (categoryId !== undefined) updateData.categoryId = categoryId;

        const updatedMod = await db
            .update(mods)
            .set(updateData)
            .where(eq(mods.id, modId))
            .returning();

        if (!updatedMod || updatedMod.length === 0) {
            return NextResponse.json({ error: "Mod not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, mod: updatedMod[0] });
    } catch (error) {
        console.error("Error updating mod:", error);
        return NextResponse.json(
            { error: "Failed to update mod" },
            { status: 500 }
        );
    }
}

// DELETE mod (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await getCurrentSession();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const modId = parseInt(id);
        
        if (isNaN(modId)) {
            return NextResponse.json({ error: "Invalid mod ID" }, { status: 400 });
        }

        // Check if mod exists
        const existingMod = await db
            .select({ id: mods.id })
            .from(mods)
            .where(eq(mods.id, modId))
            .limit(1);

        if (!existingMod || existingMod.length === 0) {
            return NextResponse.json({ error: "Mod not found" }, { status: 404 });
        }

        // Delete mod (this will cascade delete related data if foreign keys are set up properly)
        await db.delete(mods).where(eq(mods.id, modId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting mod:", error);
        return NextResponse.json(
            { error: "Failed to delete mod" },
            { status: 500 }
        );
    }
}
