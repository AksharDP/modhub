import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { systemSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentSession, isAdmin } from '../../../lib/auth';

// GET handler to fetch settings
export async function GET() {
    const { user } = await getCurrentSession();
    if (!isAdmin(user)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settings = await db.select().from(systemSettings).where(eq(systemSettings.id, 1));
        if (settings.length === 0) {
            // If no settings found, return default values
            return NextResponse.json({
                maxModFileSize: 100, // Default value
                maxImagesPerMod: 10, // Default value
                maxTotalImageSize: 50, // Default value
            });
        }
        return NextResponse.json(settings[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST handler to update settings
export async function POST(request: Request) {
    const { user } = await getCurrentSession();
    if (!isAdmin(user)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { maxModFileSize, maxImagesPerMod, maxTotalImageSize } = body;

        // Basic validation
        if (typeof maxModFileSize !== 'number' || typeof maxImagesPerMod !== 'number' || typeof maxTotalImageSize !== 'number') {
            return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
        }

        await db.insert(systemSettings).values({
            id: 1,
            maxModFileSize,
            maxImagesPerMod,
            maxTotalImageSize,
        }).onConflictDoUpdate({ target: systemSettings.id, set: { maxModFileSize, maxImagesPerMod, maxTotalImageSize } });

        return NextResponse.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
