import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth";
import { db } from "../../../db";
import { games } from "../../../db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    const { user } = await getCurrentSession();
    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const gamesList = await db
        .select({
            id: games.id,
            name: games.name,
            slug: games.slug,
            description: games.description,
            imageUrl: games.imageUrl,
            isActive: games.isActive,
            visibleToUsers: games.visibleToUsers,
            visibleToSupporters: games.visibleToSupporters,
            formSchema: games.formSchema,
            createdAt: games.createdAt,
            updatedAt: games.updatedAt,
        })
        .from(games)
        .orderBy(desc(games.name));
    return NextResponse.json({ games: gamesList });
}
