import { NextResponse } from 'next/server';
import { getStorageValidation, isStorageConfigured } from '../../../lib/storage';

export async function GET() {
  try {
    const validation = getStorageValidation();
    const isConfigured = isStorageConfigured();

    return NextResponse.json({
      configured: isConfigured,
      endpointType: validation.endpointType,
      ...(isConfigured ? {} : { missingVariables: validation.missingVariables })
    });
  } catch (error) {
    console.error('Storage status check error:', error);
    return NextResponse.json({
      configured: false,
      endpointType: 'Unknown',
      error: 'Failed to check storage status',
      missingVariables: ['Unable to determine missing variables']
    }, { status: 500 });
  }
}
