import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth";
import { uploadFile, isStorageConfigured, getStorageValidation } from "../../../lib/storage";
import { db } from "../../../db";
import { images } from "../../../db/schema";

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const { user } = await getCurrentSession();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if storage is configured
        if (!isStorageConfigured()) {
            const validation = getStorageValidation();
            return NextResponse.json({
                error: 'Storage not configured',
                details: {
                    endpointType: validation.endpointType,
                    missingVariables: validation.missingVariables
                }
            }, { status: 500 });
        }

        const contentType = request.headers.get('content-type');
        
        if (!contentType?.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'Content type must be multipart/form-data' }, { status: 400 });
        }        const formData = await request.formData();
        const file = formData.get('file') as File || formData.get('image') as File;
        const entityType = formData.get('entityType') as string || 'mod'; // Default to mod
        const entityId = formData.get('entityId') as string;
        const isMain = formData.get('isMain') === 'true';
        const alt = formData.get('alt') as string;
        const caption = formData.get('caption') as string;

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        // Validate file size (e.g., 10MB limit for images)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'Image too large. Maximum size is 10MB' }, { status: 400 });
        }

        // Validate file types for images
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ 
                error: 'Invalid image type. Allowed types: JPEG, PNG, WebP, GIF' 
            }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);        // Generate unique file key for images in format: images/<id>_<file_name>
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `images/${user.id}_${timestamp}_${sanitizedFileName}`;        // Upload to storage
        const fileUrl = await uploadFile(fileKey, buffer, file.type);

        // Save image record to database if entityId is provided
        let imageRecord = null;
        if (entityId && entityType) {
            const [newImage] = await db
                .insert(images)
                .values({
                    entityType: entityType as "mod" | "collection" | "user" | "game",
                    entityId: parseInt(entityId),
                    url: fileUrl,
                    key: fileKey,
                    fileName: file.name,
                    alt: alt || null,
                    caption: caption || null,
                    isMain: isMain || false,
                    fileSize: file.size,
                    mimeType: file.type,
                    uploadedBy: user.id,
                })
                .returning();
            imageRecord = newImage;
        }

        return NextResponse.json({
            success: true,
            imageUrl: fileUrl, // For backward compatibility
            fileUrl,
            fileKey,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
            imageId: imageRecord?.id, // New: return the database record ID
            imageRecord, // New: return the full image record
        });

    } catch (error) {
        console.error("Error in image upload:", error);
        return NextResponse.json({
            error: 'Upload failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
