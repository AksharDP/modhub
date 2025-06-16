import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/app/lib/auth";
import { db } from "@/app/db";
import { collections } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";

// Update collection details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const collectionId = parseInt(id);
        
        if (isNaN(collectionId)) {
            return NextResponse.json(
                { error: "Invalid collection ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, description, isPublic } = body;

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
        }        // Prepare update data
        const updateData: Partial<{
            name: string;
            description: string | null;
            isPublic: boolean;
        }> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        // Update collection
        const [updatedCollection] = await db
            .update(collections)
            .set(updateData)
            .where(eq(collections.id, collectionId))
            .returning();

        return NextResponse.json({ collection: updatedCollection });
    } catch (error) {
        console.error("Error updating collection:", error);
        return NextResponse.json(
            { error: "Failed to update collection" },
            { status: 500 }
        );
    }
}
