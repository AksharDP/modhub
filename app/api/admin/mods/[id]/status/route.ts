import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { db } from "../../../../../db";
import { mods } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

// UPDATE mod status (admin only)
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
        const { isActive, isFeatured } = body;

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (isActive !== undefined) updateData.isActive = isActive;
        if (isFeatured !== undefined) {
            // Only allow featured to be true if mod is active
            if (isFeatured && !isActive) {
                return NextResponse.json(
                    { error: "Cannot feature an inactive mod" },
                    { status: 400 }
                );
            }
            updateData.isFeatured = isFeatured;
        }

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
        console.error("Error updating mod status:", error);
        return NextResponse.json(
            { error: "Failed to update mod status" },
            { status: 500 }
        );
    }
}
