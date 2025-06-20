import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, generateFileKey, isStorageConfigured, getStorageValidation } from '../../lib/storage';

export async function POST(request: NextRequest) {
  try {
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
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (e.g., 100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file key
    const fileKey = generateFileKey(file.name, userId);

    // Upload to storage
    const fileUrl = await uploadFile(fileKey, buffer, file.type);

    return NextResponse.json({
      success: true,
      fileKey,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  // Return storage status
  const validation = getStorageValidation();
  const isConfigured = isStorageConfigured();

  return NextResponse.json({
    configured: isConfigured,
    endpointType: validation.endpointType,
    ...(isConfigured ? {} : { missingVariables: validation.missingVariables })
  });
}
