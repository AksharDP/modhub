import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/app/lib/auth';
import { db } from '@/app/db';
import { files, mods } from '@/app/db/schema';
import { eq, sum } from 'drizzle-orm';

// Utility function to recalculate and update mod size
async function updateModSize(modId: number): Promise<string> {
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

  return formattedSize;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modId = parseInt(params.id);
    if (isNaN(modId)) {
      return NextResponse.json({ error: 'Invalid mod ID' }, { status: 400 });
    }

    // Check if mod exists
    const modExists = await db.select({ id: mods.id })
      .from(mods)
      .where(eq(mods.id, modId))
      .limit(1);

    if (modExists.length === 0) {
      return NextResponse.json({ error: 'Mod not found' }, { status: 404 });
    }

    // Recalculate and update the size
    const newSize = await updateModSize(modId);

    return NextResponse.json({
      success: true,
      modId,
      newSize,
      message: `Mod size recalculated: ${newSize}`,
    });
  } catch (error) {
    console.error('Error recalculating mod size:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
