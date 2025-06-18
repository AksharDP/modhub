import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { games } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const game = await db
            .select({
                id: games.id,
                name: games.name,
                slug: games.slug,
                description: games.description,
                imageUrl: games.imageUrl,
                formSchema: games.formSchema,
            })
            .from(games)
            .where(eq(games.slug, slug))
            .limit(1);

        if (game.length === 0) {
            return NextResponse.json(
                { error: "Game not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ game: game[0] });
    } catch (error) {
        console.error("Error fetching game:", error);
        return NextResponse.json(
            { error: "Failed to fetch game" },
            { status: 500 }
        );
    }
}
