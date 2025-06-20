"use server";

import { z } from "zod";
import { db } from "@/app/db";
import { mods, modTags, modStats, games, images, systemSettings, files as filesTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { uploadFile, isStorageConfigured } from "@/app/lib/storage";

const ModSchema = z.object({
    title: z.string().min(1, "Title is required."),
    version: z.string().optional(),
    tags: z.string().optional(),
    isAdult: z.boolean().optional(),
    description: z.string().min(1, "Description is required."),
    game: z.string().min(1, "Game selection is required."),
});

export interface UploadState {
    message: string | null;
    errors?: {
        title?: string[];
        description?: string[];
        images?: string[];
        game?: string[];
        modFile?: string[];
        general?: string[];
    };
    success: boolean;
    slug?: string;
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function handleImageUpload(
    imageFile: File,
    userId: number,
    modId: number,
    isMain: boolean,
    order: number
): Promise<{ url: string; key: string; imageId: number }> {
    if (!isStorageConfigured()) {
        throw new Error("Image storage is not configured.");
    }

    try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9.-_]/g, '_');
        const fileKey = `images/mods/${modId}/${timestamp}_${sanitizedFileName}`;
        const fileUrl = await uploadFile(fileKey, buffer, imageFile.type);

        const [imageRecord] = await db
            .insert(images)
            .values({
                entityType: 'mod',
                entityId: modId,
                url: fileUrl,
                key: fileKey,
                fileName: imageFile.name,
                isMain,
                order,
                fileSize: imageFile.size,
                mimeType: imageFile.type,
                uploadedBy: userId,
            })
            .returning({ id: images.id });

        if (!imageRecord) {
            throw new Error("Failed to save image record to database.");
        }

        return { url: fileUrl, key: fileKey, imageId: imageRecord.id };
    } catch (error) {
        console.error(`Failed to upload image ${imageFile.name}:`, error);
        throw error; // Re-throw to be caught by the action
    }
}

async function handleModFileUpload(
    modFile: File,
    userId: number,
    modId: number,
    version: string
): Promise<{ url: string; key: string; fileId: number }> {
    if (!isStorageConfigured()) {
        throw new Error("File storage is not configured.");
    }

    try {
        const bytes = await modFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const sanitizedFileName = modFile.name.replace(/[^a-zA-Z0-9.-_]/g, '_');
        const fileKey = `files/${modId}/${version}/${sanitizedFileName}`;
        const fileUrl = await uploadFile(fileKey, buffer, modFile.type);

        const [fileRecord] = await db
            .insert(filesTable)
            .values({
                modId,
                fileName: sanitizedFileName,
                originalFileName: modFile.name,
                url: fileUrl,
                key: fileKey,
                version,
                isMainFile: true, // First upload is main, can be changed later
                fileSize: modFile.size,
                mimeType: modFile.type,
                uploadedBy: userId,
            })
            .returning({ id: filesTable.id });
        
        if (!fileRecord) {
            throw new Error("Failed to save mod file record to database.");
        }

        return { url: fileUrl, key: fileKey, fileId: fileRecord.id };
    } catch (error) {
        console.error(`Failed to upload mod file ${modFile.name}:`, error);
        throw error;
    }
}

export async function uploadModAction(
    prevState: UploadState,
    formData: FormData
): Promise<UploadState> {
    try {
        const { user } = await getCurrentSession();
        if (!user) {
            redirect("/login");
        }

        const settingsResult = await db.select().from(systemSettings).where(eq(systemSettings.id, 1));
        const currentSettings = settingsResult[0] || {
            maxModFileSize: 100,
            maxImagesPerMod: 10,
            maxTotalImageSize: 50,
        };

        const maxModFileSizeBytes = (currentSettings.maxModFileSize || 100) * 1024 * 1024;
        const maxImagesPerMod = currentSettings.maxImagesPerMod || 10;
        const maxTotalImageSizeBytes = (currentSettings.maxTotalImageSize || 50) * 1024 * 1024;

        const validatedFields = ModSchema.safeParse({
            title: formData.get("title"),
            version: formData.get("version"),
            tags: formData.get("tags"),
            isAdult: formData.get("isAdult") === "on",
            description: formData.get("description"),
            game: formData.get("game"),
        });

        if (!validatedFields.success) {
            return { message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors, success: false };
        }

        const modFile = formData.get("modFile") as File | null;
        if (!modFile || modFile.size === 0) {
            return { message: "Mod file is required.", errors: { modFile: ["Please select a mod file."] }, success: false };
        }
        if (modFile.size > maxModFileSizeBytes) {
            return { message: "File too large.", errors: { modFile: [`Mod file cannot be larger than ${currentSettings.maxModFileSize} MB.`] }, success: false };
        }

        const imageFiles = formData.getAll("modImages") as File[];
        const actualImageFiles = imageFiles.filter(file => file.size > 0);

        if (actualImageFiles.length > maxImagesPerMod) {
            return { message: "Too many images.", errors: { images: [`You can upload a maximum of ${maxImagesPerMod} images.`] }, success: false };
        }

        const totalImageSize = actualImageFiles.reduce((acc, file) => acc + file.size, 0);
        if (totalImageSize > maxTotalImageSizeBytes) {
            return { message: "Images too large.", errors: { images: [`Total image size cannot exceed ${currentSettings.maxTotalImageSize} MB.`] }, success: false };
        }

        const { title, version, tags, isAdult, description, game } = validatedFields.data;

        const gameRecords = await db.select().from(games).where(eq(games.slug, game)).limit(1);
        if (gameRecords.length === 0) {
            return { message: "Game not found.", errors: { game: ["Invalid game selected."] }, success: false };
        }
        const gameRecord = gameRecords[0];

        const slug = generateSlug(title);
        const modVersion = version || "1.0.0";

        const [newMod] = await db.insert(mods).values({
            title,
            slug,
            description,
            version: modVersion,
            isAdult: isAdult || false,
            authorId: user.id,
            gameId: gameRecord.id,
            categoryId: 6, // Default to "Content"
        }).returning({ id: mods.id });

        const modId = newMod.id;

        const modFileUploadResult = await handleModFileUpload(modFile, user.id, modId, modVersion);

        let thumbnailImageId: number | null = null;
        let thumbnailUrl: string | null = null;

        if (actualImageFiles.length > 0) {
            const imageUploadPromises = actualImageFiles.map((file, index) =>
                handleImageUpload(file, user.id, modId, index === 0, index)
            );
            const uploadedImages = await Promise.all(imageUploadPromises);
            const firstImage = uploadedImages[0];
            if (firstImage?.imageId) {
                thumbnailImageId = firstImage.imageId;
                thumbnailUrl = firstImage.url;
            }
        }

        await db.update(mods).set({
            downloadUrl: modFileUploadResult.url,
            downloadKey: modFileUploadResult.key,
            thumbnailImageId: thumbnailImageId,
            imageUrl: thumbnailUrl,
        }).where(eq(mods.id, modId));

        await db.insert(modStats).values({ modId });

        if (tags) {
            const tagList = tags.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag);
            if (tagList.length > 0) {
                await db.insert(modTags).values(tagList.map((tag: string) => ({ modId, tag })));
            }
        }

        console.log(`Mod \"${title}\" created successfully with ID ${modId}`);
        // This redirect is not working as expected with useActionState.
        // A client-side redirect based on the success flag is better.
        // redirect(`/mod/${slug}`);

        return { message: `Mod "${title}" uploaded successfully!`, success: true, slug };

    } catch (error) {
        console.error("Critical error in uploadModAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { message: "An unexpected error occurred.", errors: { general: [errorMessage] }, success: false };
    }
}
