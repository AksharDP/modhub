import { NextResponse } from 'next/server';
import { getCurrentSession } from '../../../lib/auth';
import { db } from '../../../db';
import { mods, userTable } from '../../../db/schema';
import { count, sql } from 'drizzle-orm';
import { isStorageConfigured, getStorageValidation } from '../../../lib/storage';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const { user } = await getCurrentSession();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Get basic system health metrics
    const [
      totalUsersResult,
      totalModsResult,
      activeModsResult
    ] = await Promise.all([
      db.select({ count: count() }).from(userTable),
      db.select({ count: count() }).from(mods),
      db.select({ count: count() }).from(mods).where(sql`is_active = true`)
    ]);

    const totalUsers = totalUsersResult[0].count;
    const totalMods = totalModsResult[0].count;
    const activeMods = activeModsResult[0].count;

    // Get storage status
    const storageConfigured = isStorageConfigured();
    const storageValidation = getStorageValidation();

    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
    };

    // Calculate health score (0-100)
    let healthScore = 100;
    if (!storageConfigured) healthScore -= 30;
    if (totalMods === 0) healthScore -= 10;
    if (totalUsers === 0) healthScore -= 10;
    if (systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal > 0.8) healthScore -= 20;

    const health = {
      score: Math.max(0, healthScore),
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'fair' : 'poor',
      checks: {
        database: {
          status: 'healthy',
          message: 'Database connection is working'
        },
        storage: {
          status: storageConfigured ? 'healthy' : 'warning',
          message: storageConfigured 
            ? `Storage configured (${storageValidation.endpointType})`
            : `Storage not configured: Missing ${storageValidation.missingVariables.join(', ')}`
        },
        memory: {
          status: systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal < 0.8 ? 'healthy' : 'warning',
          message: `Memory usage: ${Math.round((systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal) * 100)}%`
        },
        content: {
          status: totalMods > 0 ? 'healthy' : 'warning',
          message: `${totalMods} total mods, ${activeMods} active`
        }
      }
    };

    return NextResponse.json({
      health,
      metrics: {
        users: totalUsers,
        mods: totalMods,
        activeMods,
        system: systemMetrics
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      health: {
        score: 0,
        status: 'critical',
        checks: {
          system: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
