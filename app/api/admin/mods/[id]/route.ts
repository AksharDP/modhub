import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../lib/auth";
import { db } from "../../../../db";
import { mods, modStats } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
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
            .select()
            .from(mods)
            .where(eq(mods.id, modId))
            .limit(1);

        if (existingMod.length === 0) {
            return NextResponse.json(
                { error: "Mod not found" },
                { status: 404 }
            );
        }

        // Delete related modStats first (if any)
        await db.delete(modStats).where(eq(modStats.modId, modId));

        // Delete the mod
        await db.delete(mods).where(eq(mods.id, modId));

        return NextResponse.json({
            message: "Mod deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting mod:", error);
        return NextResponse.json(
            { error: "Failed to delete mod" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const { user } = await getCurrentSession();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const modId = parseInt(id);
        
        if (isNaN(modId)) {
            return NextResponse.json({ error: "Invalid mod ID" }, { status: 400 });
        }

        // Get the mod data
        const mod = await db
            .select()
            .from(mods)
            .where(eq(mods.id, modId))
            .limit(1);

        if (mod.length === 0) {
            return NextResponse.json(
                { error: "Mod not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ mod: mod[0] });
    } catch (error) {
        console.error("Error fetching mod:", error);
        return NextResponse.json(
            { error: "Failed to fetch mod" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
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
        const { title, description, version, imageUrl, isActive, isFeatured, isAdult } = body;        // Build update object with only provided fields
        const updateData: Partial<{
            title: string;
            description: string;
            version: string;
            imageUrl: string;
            isActive: boolean;
            isFeatured: boolean;
            isAdult: boolean;
        }> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (version !== undefined) updateData.version = version;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (typeof isActive === "boolean") updateData.isActive = isActive;
        if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
        if (typeof isAdult === "boolean") updateData.isAdult = isAdult;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const result = await db
            .update(mods)
            .set(updateData)
            .where(eq(mods.id, modId))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Mod not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Mod updated successfully",
            mod: result[0],
        });
    } catch (error) {
        console.error("Error updating mod:", error);
        return NextResponse.json(
            { error: "Failed to update mod" },
            { status: 500 }
        );
    }
}
