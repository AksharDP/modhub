import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/app/lib/auth';
import { getSignedUploadUrl } from '@/app/lib/storage';
import { db } from '@/app/db';
import { images, files } from '@/app/db/schema';

interface PresignedUrlRequest {
  gameSlug: string;
  modId: number;
  fileType: 'image' | 'mod';
  fileName: string;
  contentType: string;
  version?: string; // Optional for mod files
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    const body: PresignedUrlRequest = await request.json();
    const { gameSlug, modId, fileType, fileName, contentType, version } = body;

    if (!gameSlug || !modId || !fileType || !fileName || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let recordId: number;
    let storageKey: string;    if (fileType === 'image') {
      // Create image record
      const [imageRecord] = await db.insert(images).values({
        entityType: 'mod',
        entityId: modId,
        url: '', // Will be updated after upload
        key: '', // Will be updated after upload
        fileName,
        fileSize: 0, // Will be updated after upload
        mimeType: contentType,
        uploadedBy: user.id,
        createdAt: new Date(),
      }).returning();

      recordId = imageRecord.id;
      storageKey = `images/${gameSlug}/${modId}/${recordId}_${fileName}`;
    } else {      // Create file record  
      const [fileRecord] = await db.insert(files).values({
        modId,
        fileName,
        originalFileName: fileName,
        url: '', // Will be updated after upload
        key: '', // Will be updated after upload
        version: version || '1.0.0', // Use provided version or default
        fileSize: 0, // Will be updated after upload
        mimeType: contentType,
        uploadedBy: user.id,
        createdAt: new Date(),
      }).returning();

      recordId = fileRecord.id;
      storageKey = `mods/${gameSlug}/${modId}/${recordId}_${fileName}`;
    }

    // Generate pre-signed URL
    const presignedUrl = await getSignedUploadUrl(storageKey, contentType, 3600); // 1 hour expiry

    return NextResponse.json({
      presignedUrl,
      recordId,
      storageKey,
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
