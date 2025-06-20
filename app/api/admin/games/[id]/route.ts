import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { games } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin, getCurrentSession } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user } = await getCurrentSession();
    if (!isAdmin(user)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { formSchema } = body;

        const resolvedParams = await params;
        const gameId = parseInt(resolvedParams.id, 10);
        if (isNaN(gameId)) {
            return NextResponse.json({ message: 'Invalid game ID' }, { status: 400 });
        }

        const updatedGame = await db.update(games).set({ formSchema, updatedAt: new Date() }).where(eq(games.id, gameId)).returning();

        if (updatedGame.length === 0) {
            return NextResponse.json({ message: 'Game not found' }, { status: 404 });
        }

        return NextResponse.json(updatedGame[0]);
    } catch (error) {
        console.error('Error updating game:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
