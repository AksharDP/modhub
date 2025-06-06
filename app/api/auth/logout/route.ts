import { NextResponse } from "next/server";
import {
    getSessionToken,
    validateSessionToken,
    invalidateSession,
    deleteSessionTokenCookie,
} from "../../../lib/auth";

export async function POST() {
    try {
        const sessionToken = await getSessionToken();

        if (sessionToken) {
            const { session } = await validateSessionToken(sessionToken);
            if (session) {
                await invalidateSession(session.id);
            }
        }

        await deleteSessionTokenCookie();

        return NextResponse.json(
            { message: "Logout successful" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
