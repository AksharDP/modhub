import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '../../../lib/auth';
import { uploadFile, generateFileKey, isStorageConfigured, getStorageValidation } from '../../../lib/storage';

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
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modId = formData.get('modId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (e.g., 500MB limit for mod files)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 500MB' }, { status: 400 });
    }

    // Validate file types for mod files
    const allowedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: ' + allowedExtensions.join(', ') 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique file key for mod files
    const fileKey = generateFileKey(file.name, user.id.toString());

    // Upload to storage
    const fileUrl = await uploadFile(fileKey, buffer, file.type || 'application/octet-stream');

    return NextResponse.json({
      success: true,
      fileKey,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      modId
    });

  } catch (error) {
    console.error('Mod file upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
