import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/app/lib/auth";
import { db } from "@/app/db";
import { collections, collectionMods } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Add mod to collection
export async function POST(request: NextRequest) {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { collectionId, modId } = body;

        if (!collectionId || !modId) {
            return NextResponse.json(
                { error: "Collection ID and Mod ID are required" },
                { status: 400 }
            );
        }

        // Verify user owns the collection
        const collection = await db
            .select()
            .from(collections)
            .where(and(eq(collections.id, collectionId), eq(collections.userId, user.id)))
            .limit(1);

        if (collection.length === 0) {
            return NextResponse.json(
                { error: "Collection not found or unauthorized" },
                { status: 404 }
            );
        }

        // Check if mod is already in collection
        const existingEntry = await db
            .select()
            .from(collectionMods)
            .where(and(eq(collectionMods.collectionId, collectionId), eq(collectionMods.modId, modId)))
            .limit(1);

        if (existingEntry.length > 0) {
            return NextResponse.json(
                { error: "Mod is already in this collection" },
                { status: 400 }
            );
        }        // Get current max order for this collection
        const maxOrderResult = await db
            .select({ maxOrder: collectionMods.order })
            .from(collectionMods)
            .where(eq(collectionMods.collectionId, collectionId))
            .orderBy(desc(collectionMods.order))
            .limit(1);

        const nextOrder = maxOrderResult.length > 0 && maxOrderResult[0].maxOrder !== null 
            ? maxOrderResult[0].maxOrder + 1 
            : 0;

        // Add mod to collection
        await db.insert(collectionMods).values({
            collectionId,
            modId,
            order: nextOrder,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error adding mod to collection:", error);
        return NextResponse.json(
            { error: "Failed to add mod to collection" },
            { status: 500 }
        );
    }
}

// Remove mod from collection
export async function DELETE(request: NextRequest) {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { collectionId, modId } = body;

        if (!collectionId || !modId) {
            return NextResponse.json(
                { error: "Collection ID and Mod ID are required" },
                { status: 400 }
            );
        }

        // Verify user owns the collection
        const collection = await db
            .select()
            .from(collections)
            .where(and(eq(collections.id, collectionId), eq(collections.userId, user.id)))
            .limit(1);

        if (collection.length === 0) {
            return NextResponse.json(
                { error: "Collection not found or unauthorized" },
                { status: 404 }
            );
        }

        // Remove mod from collection
        await db
            .delete(collectionMods)
            .where(and(eq(collectionMods.collectionId, collectionId), eq(collectionMods.modId, modId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing mod from collection:", error);
        return NextResponse.json(
            { error: "Failed to remove mod from collection" },
            { status: 500 }
        );
    }
}

// Update mod order in collection
export async function PUT(request: NextRequest) {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { collectionId, order } = body; // order: array of modIds in new order

        if (!collectionId || !Array.isArray(order)) {
            return NextResponse.json(
                { error: "Collection ID and order array are required" },
                { status: 400 }
            );
        }

        // Verify user owns the collection
        const collection = await db
            .select()
            .from(collections)
            .where(and(eq(collections.id, collectionId), eq(collections.userId, user.id)))
            .limit(1);

        if (collection.length === 0) {
            return NextResponse.json(
                { error: "Collection not found or unauthorized" },
                { status: 404 }
            );
        }

        // Update order for each mod
        for (let i = 0; i < order.length; i++) {
            const modId = order[i];
            await db
                .update(collectionMods)
                .set({ order: i })
                .where(and(eq(collectionMods.collectionId, collectionId), eq(collectionMods.modId, modId)));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating mod order in collection:", error);
        return NextResponse.json(
            { error: "Failed to update mod order in collection" },
            { status: 500 }
        );
    }
}
