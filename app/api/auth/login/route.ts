import { NextRequest, NextResponse } from "next/server";
import {
    getUserByUsername,
    verifyPassword,
    generateSessionToken,
    createSession,
    setSessionTokenCookie,
    isValidUsername,
} from "../../../lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (typeof username !== "string" || typeof password !== "string") {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        if (!isValidUsername(username)) {
            return NextResponse.json(
                { error: "Invalid username format" },
                { status: 400 }
            );
        }

        const user = await getUserByUsername(username);
        if (!user) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 400 }
            );
        }

        const validPassword = await verifyPassword(password, user.passwordHash);
        if (!validPassword) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 400 }
            );
        }

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);
        await setSessionTokenCookie(sessionToken, session.expiresAt);        return NextResponse.json(
            {
                message: "Login successful",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    suspendedUntil: user.suspendedUntil,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
