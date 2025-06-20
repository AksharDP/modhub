import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/app/lib/auth';
import { db } from '@/app/db';
import { images, files, mods } from '@/app/db/schema';
import { eq, sum } from 'drizzle-orm';
import { getFileUrl } from '@/app/lib/storage';

interface FinalizeUploadRequest {
  recordId: number;
  fileType: 'image' | 'mod';
  storageKey: string;
  fileSize: number;
}

// Utility function to recalculate and update mod size
async function updateModSize(modId: number): Promise<void> {
  // Calculate total size of all files for this mod
  const totalSizeResult = await db.select({ 
    totalSize: sum(files.fileSize) 
  })
  .from(files)
  .where(eq(files.modId, modId));

  const totalSizeBytes = totalSizeResult[0]?.totalSize || 0;
  
  // Format size for display (convert bytes to human readable format)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formattedSize = formatFileSize(Number(totalSizeBytes));

  // Update the mod's size field
  await db.update(mods)
    .set({
      size: formattedSize,
      updatedAt: new Date(),
    })
    .where(eq(mods.id, modId));
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: FinalizeUploadRequest = await request.json();
    const { recordId, fileType, storageKey, fileSize } = body;

    if (!recordId || !fileType || !storageKey || !fileSize) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileUrl = getFileUrl(storageKey);

    if (fileType === 'image') {
      // Update image record
      await db.update(images)
        .set({
          url: fileUrl,
          key: storageKey,
          fileSize,
          updatedAt: new Date(),
        })
        .where(eq(images.id, recordId));    } else {
      // Update file record
      await db.update(files)
        .set({
          url: fileUrl,
          key: storageKey,
          fileSize,
          updatedAt: new Date(),
        })
        .where(eq(files.id, recordId));

      // After updating the file, get the mod ID and update the total size
      const fileRecord = await db.select({ modId: files.modId })
        .from(files)
        .where(eq(files.id, recordId))
        .limit(1);

      if (fileRecord.length > 0) {
        const modId = fileRecord[0].modId;
        await updateModSize(modId);
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Error finalizing upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
