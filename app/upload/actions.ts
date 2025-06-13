"use server";

import { z } from "zod";

const ModSchema = z.object({
    title: z.string().min(1, "Title is required."),
    version: z.string().optional(),
    tags: z.string().optional(),
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

export async function uploadModAction(
    prevState: UploadState,
    formData: FormData
): Promise<UploadState> {
    console.log("uploadModAction invoked on server.");
    try {        const validatedFields = ModSchema.safeParse({
            title: formData.get("title"),
            version: formData.get("version"),
            tags: formData.get("tags"),
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

        const { title, version, tags, description } = validatedFields.data;

        const imageFiles = formData.getAll("modImages") as File[];

        const actualImageFiles = imageFiles.filter(
            (file) => !(file.size === 0 && file.name === "")
        );

        console.log("Server Action: Received data:");
        console.log("Title:", title);
        console.log("Version:", version);
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

        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
            message: `Mod "${title}" submitted successfully with ${
                actualImageFiles.filter((f) => f.name || f.size > 0).length
            } image(s).`,
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
