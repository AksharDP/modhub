import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/app/lib/auth";
import { db } from "@/app/db";
import { collections } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// Get user's collections
export async function GET() {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userCollections = await db
            .select({
                id: collections.id,
                name: collections.name,
                description: collections.description,
                isPublic: collections.isPublic,
                createdAt: collections.createdAt,
                updatedAt: collections.updatedAt,
            })
            .from(collections)
            .where(eq(collections.userId, user.id));

        return NextResponse.json({ collections: userCollections });
    } catch (error) {
        console.error("Error fetching user collections:", error);
        return NextResponse.json(
            { error: "Failed to fetch collections" },
            { status: 500 }
        );
    }
}

// Create a new collection
export async function POST(request: NextRequest) {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, isPublic } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Collection name is required" },
                { status: 400 }
            );
        }

        const [newCollection] = await db
            .insert(collections)
            .values({
                userId: user.id,
                name: name.trim(),
                description: description?.trim() || null,
                isPublic: Boolean(isPublic),
            })
            .returning();

        return NextResponse.json({ collection: newCollection });
    } catch (error) {
        console.error("Error creating collection:", error);
        return NextResponse.json(
            { error: "Failed to create collection" },
            { status: 500 }
        );
    }
}
