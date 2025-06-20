import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const { user } = await getCurrentSession();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    switch (action) {
      case 'clear-cache':
        // In a real application, you would clear various caches here
        // For example: Redis cache, Next.js cache, etc.
        console.log('Admin cleared cache');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        });

      case 'refresh-stats':
        // In a real application, you might invalidate stats cache
        console.log('Admin requested stats refresh');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Stats refresh initiated',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('System action error:', error);
    return NextResponse.json({
      error: 'System action failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const { user } = await getCurrentSession();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return system status information
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      version: process.version
    });

  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json({
      error: 'Failed to get system status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
