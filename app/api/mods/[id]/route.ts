import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { mods, games, categories, modStats, userTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").filter(Boolean).pop();
    const modId = parseInt(id || "");
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
        size: mods.size,
        createdAt: mods.createdAt,
        updatedAt: mods.updatedAt,
        downloadUrl: mods.downloadUrl,
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
          totalDownloads: modStats.totalDownloads,
          likes: modStats.likes,
          rating: modStats.rating,
          ratingCount: modStats.ratingCount,
        },
      })
      .from(mods)
      .where(eq(mods.id, modId))
      .leftJoin(userTable, eq(mods.authorId, userTable.id))
      .leftJoin(games, eq(mods.gameId, games.id))
      .leftJoin(categories, eq(mods.categoryId, categories.id))
      .leftJoin(modStats, eq(mods.id, modStats.modId));

    if (!modData || !modData[0]) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    return NextResponse.json({ ...modData[0] });
  } catch (error) {
    console.error("Error fetching mod by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch mod by ID" },
      { status: 500 }
    );
  }
}
