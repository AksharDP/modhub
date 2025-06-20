"use server";

import { z } from "zod";
import { db } from "@/app/db";
import { mods, modTags, modStats, games, categories } from "@/app/db/schema";
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

export interface CreateModState {
    message: string | null;
    errors?: {
        title?: string[];
        description?: string[];
        game?: string[];
        general?: string[];
    };
    success: boolean;
    modId?: number;
    gameSlug?: string;
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export async function createModAction(
    prevState: CreateModState,
    formData: FormData
): Promise<CreateModState> {
    try {
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
                success: false 
            };
        }

        const { title, version, tags, isAdult, description, game } = validatedFields.data;        const gameRecords = await db.select().from(games).where(eq(games.slug, game)).limit(1);
        if (gameRecords.length === 0) {
            return { 
                message: "Game not found.", 
                errors: { game: ["Invalid game selected."] }, 
                success: false 
            };
        }
        const gameRecord = gameRecords[0];

        // Get the first category as default (we'll need a better system later)
        const categoryRecords = await db.select().from(categories).limit(1);
        if (categoryRecords.length === 0) {
            return { 
                message: "No categories available.", 
                errors: { general: ["No categories available. Please contact admin."] }, 
                success: false 
            };
        }
        const defaultCategory = categoryRecords[0];

        const slug = generateSlug(title);
        const modVersion = version || "1.0.0";

        // Create the mod record
        const [newMod] = await db.insert(mods).values({
            title,
            slug,
            description,
            version: modVersion,
            gameId: gameRecord.id,
            categoryId: defaultCategory.id,
            authorId: user.id,
            isAdult: isAdult || false,
            isActive: true,
        }).returning();

        if (!newMod) {
            return { 
                message: "Failed to create mod.", 
                errors: { general: ["Failed to create mod."] }, 
                success: false 
            };
        }        // Handle tags if provided
        if (tags && tags.trim()) {
            const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            if (tagList.length > 0) {
                const tagInserts = tagList.map(tag => ({
                    modId: newMod.id,
                    tag: tag,
                }));
                await db.insert(modTags).values(tagInserts);
            }
        }

        // Create initial mod stats
        await db.insert(modStats).values({
            modId: newMod.id,
            totalDownloads: 0,
            weeklyDownloads: 0,
            monthlyDownloads: 0,
            likes: 0,
            views: 0,
        });

        return {
            message: "Mod created successfully. Now upload your files.",
            success: true,
            modId: newMod.id,
            gameSlug: gameRecord.slug,
        };

    } catch (error) {
        console.error("Error creating mod:", error);
        return { 
            message: "An unexpected error occurred.", 
            errors: { general: ["An unexpected error occurred."] }, 
            success: false 
        };
    }
}
