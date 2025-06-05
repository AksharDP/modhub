"use server";

import { z } from "zod";

// Define a schema for validation (optional but good practice)
const ModSchema = z.object({
    title: z.string().min(1, "Title is required."),
    version: z.string().optional(),
    tags: z.string().optional(), // Tags are received as a comma-separated string
    description: z.string().min(1, "Description is required."),
});

export interface UploadState {
    message: string | null;
    errors?: {
        title?: string[];
        description?: string[];
        images?: string[];
        general?: string[];
    };
    success: boolean;
}

export async function uploadModAction(
    prevState: UploadState,
    formData: FormData
): Promise<UploadState> {
    console.log("uploadModAction invoked on server."); // Diagnostic log
    try {
        const validatedFields = ModSchema.safeParse({
            title: formData.get("title"),
            version: formData.get("version"),
            tags: formData.get("tags"),
            description: formData.get("description"),
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

        const actualImageFiles = imageFiles.filter(file => !(file.size === 0 && file.name === "")); // Ensure not to filter out legitimate empty files if any, but target specifically uninitialized file objects if that's a concern. The previous filter for "placeholder.empty" was removed, this is a general check for truly empty/unnamed files.

        console.log("Server Action: Received data:");
        console.log("Title:", title);
        console.log("Version:", version);
        console.log("Tags:", tags ? tags.split(",").map(tag => tag.trim()).filter(tag => tag) : []);
        console.log("Description:", description);
        console.log("Number of actual images:", actualImageFiles.length);
        actualImageFiles.forEach((file) => {
            if (file.name || file.size > 0) { // Log only if it seems like a real file
                console.log(`- ${file.name} (${file.type}, ${file.size} bytes)`);
            }
        });

        // Simulate backend processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            message: `Mod "${title}" submitted successfully with ${actualImageFiles.filter(f => f.name || f.size > 0).length} image(s).`,
            success: true,
        };
    } catch (error) {
        console.error("Critical error in uploadModAction:", error);
        // Ensure a serializable error object if 'error' itself isn't
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            message: "An unexpected error occurred on the server.",
            errors: { general: ["Server-side exception: " + errorMessage] },
            success: false,
        };
    }
}
