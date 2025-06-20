import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { mods, games, categories, modStats, userTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getEntityImages, getModFiles } from "@/app/lib/mediaUtils";
import { getPresignedUrl } from "@/app/lib/r2-presigned-url";
import { deleteFilesFromR2, moveFileInR2 } from "@/app/lib/r2-storage";

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
        thumbnailImageId: mods.thumbnailImageId,
        size: mods.size,
        isAdult: mods.isAdult,
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

    const mod = modData[0];

    // Fetch images from the unified images table
    const modImagesFromDb = await getEntityImages('mod', modId);
    const modImages = await Promise.all(
      modImagesFromDb.map(async (image) => {
        if (image.key) {
          const presignedUrl = await getPresignedUrl(image.key);
          return { ...image, url: presignedUrl || image.url };
        }
        return image;
      })
    );

    // Fetch files from the unified files table (newest first)
    const modFilesFromDb = await getModFiles(modId);
    const modFiles = await Promise.all(
      modFilesFromDb.map(async (file) => {
        if (file.key) {
          const presignedUrl = await getPresignedUrl(file.key);
          return { ...file, url: presignedUrl || file.url };
        }
        return file;
      })
    );

    let thumbnailUrl = mod.imageUrl;
    if (mod.thumbnailImageId) {
        const mainImage = modImages.find(img => img.id === mod.thumbnailImageId);
        if (mainImage) {
            thumbnailUrl = mainImage.url;
        }
    }

    return NextResponse.json({ 
      ...mod, 
      imageUrl: thumbnailUrl,
      images: modImages,
      files: modFiles
    });
  } catch (error) {
    console.error("Error fetching mod by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch mod by ID" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").filter(Boolean).pop();
    const modId = parseInt(id || "");
    if (isNaN(modId)) {
      return NextResponse.json({ error: "Invalid mod ID" }, { status: 400 });
    }

    const { deleteFiles } = await request.json();

    const modImages = await getEntityImages('mod', modId);
    const modFiles = await getModFiles(modId, false); // Get all files, not just active

    const imageKeys = modImages.map(img => img.key).filter(Boolean) as string[];
    const fileKeys = modFiles.map(f => f.key).filter(Boolean) as string[];

    if (deleteFiles) {
      await deleteFilesFromR2([...imageKeys, ...fileKeys]);
    } else {
      for (const key of [...imageKeys, ...fileKeys]) {
        await moveFileInR2(key);
      }
    }

    await db.delete(mods).where(eq(mods.id, modId));

    return NextResponse.json({ message: "Mod deleted successfully" });
  } catch (error) {
    console.error("Error deleting mod:", error);
    return NextResponse.json(
      { error: "Failed to delete mod" },
      { status: 500 }
    );
  }
}
