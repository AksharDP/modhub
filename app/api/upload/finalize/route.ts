import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/app/lib/auth';
import { db } from '@/app/db';
import { images, files } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { getFileUrl } from '@/app/lib/storage';

interface FinalizeUploadRequest {
  recordId: number;
  fileType: 'image' | 'mod';
  storageKey: string;
  fileSize: number;
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
        .where(eq(images.id, recordId));
    } else {
      // Update file record
      await db.update(files)
        .set({
          url: fileUrl,
          key: storageKey,
          fileSize,
          updatedAt: new Date(),
        })
        .where(eq(files.id, recordId));
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
