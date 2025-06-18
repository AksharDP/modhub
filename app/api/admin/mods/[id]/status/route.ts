import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../../../lib/auth";
import { db } from "../../../../../db";
import { mods } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

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
        const { isActive, isFeatured } = body;

        // Validate required fields
        if (typeof isActive !== "boolean") {
            return NextResponse.json(
                { error: "isActive must be a boolean" },
                { status: 400 }
            );
        }

        // Update the mod status
        const updateData: { isActive: boolean; isFeatured?: boolean } = {
            isActive,
        };

        if (typeof isFeatured === "boolean") {
            updateData.isFeatured = isFeatured;
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
            message: "Mod status updated successfully",
            mod: result[0],
        });
    } catch (error) {
        console.error("Error updating mod status:", error);
        return NextResponse.json(
            { error: "Failed to update mod status" },
            { status: 500 }
        );
    }
}
