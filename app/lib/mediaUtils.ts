import { db } from "../db";
import { images, files, mods, collections } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export type EntityType = "mod" | "collection" | "user" | "game";

// Image operations
export async function getEntityImages(entityType: EntityType, entityId: number) {
    return await db
        .select()
        .from(images)
        .where(and(
            eq(images.entityType, entityType),
            eq(images.entityId, entityId)
        ))
        .orderBy(images.order, images.createdAt);
}

export async function getMainImage(entityType: EntityType, entityId: number) {
    const result = await db
        .select()
        .from(images)
        .where(and(
            eq(images.entityType, entityType),
            eq(images.entityId, entityId),
            eq(images.isMain, true)
        ))
        .limit(1);
    
    return result[0] || null;
}

export async function updateMainImage(entityType: EntityType, entityId: number, imageId: number) {
    // First, unset any existing main image
    await db
        .update(images)
        .set({ isMain: false })
        .where(and(
            eq(images.entityType, entityType),
            eq(images.entityId, entityId),
            eq(images.isMain, true)
        ));
    
    // Set the new main image
    await db
        .update(images)
        .set({ isMain: true })
        .where(eq(images.id, imageId));
    
    // Update the entity's thumbnail reference
    if (entityType === 'mod') {
        await db
            .update(mods)
            .set({ thumbnailImageId: imageId })
            .where(eq(mods.id, entityId));
    } else if (entityType === 'collection') {
        await db
            .update(collections)
            .set({ thumbnailImageId: imageId })
            .where(eq(collections.id, entityId));
    }
}

// File operations  
export async function getModFiles(modId: number, activeOnly: boolean = true) {
    const conditions = [eq(files.modId, modId)];
    if (activeOnly) {
        conditions.push(eq(files.isActive, true));
    }
    
    return await db
        .select({
            id: files.id,
            fileName: files.fileName,
            originalFileName: files.originalFileName,
            url: files.url,
            key: files.key,
            version: files.version,
            changelog: files.changelog,
            isMainFile: files.isMainFile,
            fileSize: files.fileSize,
            mimeType: files.mimeType,
            downloadCount: files.downloadCount,
            isActive: files.isActive,
            createdAt: files.createdAt,
            updatedAt: files.updatedAt,
        })
        .from(files)
        .where(and(...conditions))
        .orderBy(desc(files.createdAt)); // Newest files first
}

export async function getMainFile(modId: number) {
    const result = await db
        .select()
        .from(files)
        .where(and(
            eq(files.modId, modId),
            eq(files.isMainFile, true),
            eq(files.isActive, true)
        ))
        .limit(1);
    
    return result[0] || null;
}

export async function setMainFile(modId: number, fileId: number) {
    // First, unset any existing main file
    await db
        .update(files)
        .set({ isMainFile: false })
        .where(and(
            eq(files.modId, modId),
            eq(files.isMainFile, true)
        ));
    
    // Set the new main file
    await db
        .update(files)
        .set({ isMainFile: true })
        .where(eq(files.id, fileId));
}

export async function incrementDownloadCount(fileId: number) {
    await db
        .update(files)
        .set({ downloadCount: sql`${files.downloadCount} + 1` })
        .where(eq(files.id, fileId));
}

// Combined operations for mod cards (optimized for viewing)
export async function getModWithThumbnail(modId: number) {
    const result = await db
        .select({
            id: mods.id,
            title: mods.title,
            slug: mods.slug,
            description: mods.description,
            version: mods.version,
            imageUrl: mods.imageUrl, // Fallback for backward compatibility
            thumbnailImageId: mods.thumbnailImageId,
            thumbnailUrl: images.url,
            thumbnailAlt: images.alt,
            isActive: mods.isActive,
            isFeatured: mods.isFeatured,
            isAdult: mods.isAdult,
            authorId: mods.authorId,
            gameId: mods.gameId,
            categoryId: mods.categoryId,
            createdAt: mods.createdAt,
            updatedAt: mods.updatedAt,
        })
        .from(mods)
        .leftJoin(images, eq(mods.thumbnailImageId, images.id))
        .where(eq(mods.id, modId))
        .limit(1);
    
    return result[0] || null;
}

// Get mods with their thumbnails for card display (optimized query)
export async function getModsWithThumbnails(limit: number = 20, offset: number = 0) {
    return await db
        .select({
            id: mods.id,
            title: mods.title,
            slug: mods.slug,
            description: mods.description,
            version: mods.version,
            imageUrl: mods.imageUrl, // Fallback
            thumbnailUrl: images.url,
            thumbnailAlt: images.alt,
            isActive: mods.isActive,
            isFeatured: mods.isFeatured,
            isAdult: mods.isAdult,
            authorId: mods.authorId,
            gameId: mods.gameId,
            categoryId: mods.categoryId,
            createdAt: mods.createdAt,
        })
        .from(mods)
        .leftJoin(images, eq(mods.thumbnailImageId, images.id))
        .where(eq(mods.isActive, true))
        .orderBy(desc(mods.createdAt))
        .limit(limit)
        .offset(offset);
}
