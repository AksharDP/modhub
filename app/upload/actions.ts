"use server";

import { z } from "zod";
import { db } from "@/app/db";
import { mods, modTags, modStats, games } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";

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
        general?: string[];
    };
    success: boolean;
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export async function uploadModAction(
    prevState: UploadState,
    formData: FormData
): Promise<UploadState> {
    console.log("uploadModAction invoked on server.");
    
    try {
        // Check if user is authenticated
        const { user } = await getCurrentSession();
        if (!user) {
            redirect("/login");
        }

        const validatedFields = ModSchema.safeParse({
            title: formData.get("title"),
            version: formData.get("version"),
            tags: formData.get("tags"),
            isAdult: formData.get("isAdult") === "on",
            description: formData.get("description"),
            game: formData.get("game"),
        });

        if (!validatedFields.success) {
            return {
                message: "Validation failed.",
                errors: validatedFields.error.flatten().fieldErrors,
                success: false,
            };
        }

        const { title, version, tags, isAdult, description, game } = validatedFields.data;

        // Find the game by slug
        const gameRecord = await db
            .select()
            .from(games)
            .where(eq(games.slug, game))
            .limit(1);

        if (gameRecord.length === 0) {
            return {
                message: "Selected game not found.",
                errors: { game: ["Invalid game selection."] },
                success: false,
            };
        }

        const imageFiles = formData.getAll("modImages") as File[];
        const actualImageFiles = imageFiles.filter(
            (file) => !(file.size === 0 && file.name === "")
        );

        console.log("Server Action: Received data:");
        console.log("Title:", title);
        console.log("Version:", version);
        console.log("Is Adult:", isAdult);
        console.log("Game:", game);
        console.log("User ID:", user.id);
        console.log(
            "Tags:",
            tags
                ? tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag)
                : []
        );
        console.log("Description:", description);
        console.log("Number of actual images:", actualImageFiles.length);
        actualImageFiles.forEach((file) => {
            if (file.name || file.size > 0) {
                console.log(
                    `- ${file.name} (${file.type}, ${file.size} bytes)`
                );
            }
        });

        // Generate slug
        const slug = generateSlug(title);

        // Use a placeholder image if no image is uploaded
        const imageUrl = actualImageFiles.length > 0 && actualImageFiles[0].size > 0
            ? "https://placehold.co/800x600/6366F1/FFFFFF/png?text=Mod+Image" // TODO: Replace with actual image upload
            : "https://placehold.co/800x600/6366F1/FFFFFF/png?text=No+Image";

        // Create the mod record
        const newMod = await db
            .insert(mods)
            .values({
                title,
                slug,
                description,
                version: version || "1.0.0",
                imageUrl,
                isAdult: isAdult || false,
                authorId: user.id,
                gameId: gameRecord[0].id,
                categoryId: 6, // Default to "Content" category
            })
            .returning({ id: mods.id });

        const modId = newMod[0].id;

        // Create mod stats entry
        await db.insert(modStats).values({
            modId,
            totalDownloads: 0,
            weeklyDownloads: 0,
            monthlyDownloads: 0,
            likes: 0,
            views: 0,
            rating: 0,
            ratingCount: 0,
        });

        // Process tags if provided
        if (tags) {
            const tagList = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag);

            if (tagList.length > 0) {
                const tagRecords = tagList.map((tag) => ({
                    modId,
                    tag,
                }));
                await db.insert(modTags).values(tagRecords);
            }
        }

        console.log(`Mod "${title}" created successfully with ID ${modId}`);

        return {
            message: `Mod "${title}" uploaded successfully! ${
                actualImageFiles.filter((f) => f.name || f.size > 0).length
            } image(s) processed.`,
            success: true,
        };
    } catch (error) {
        console.error("Critical error in uploadModAction:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return {
            message: "An unexpected error occurred on the server.",
            errors: { general: ["Server-side exception: " + errorMessage] },
            success: false,
        };
    }
}
