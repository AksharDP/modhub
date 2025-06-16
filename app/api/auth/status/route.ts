import { NextResponse } from "next/server";
import { getCurrentSession } from "@/app/lib/auth";

export async function GET() {
    try {
        const { user, session } = await getCurrentSession();

        if (user && session) {
            return NextResponse.json({
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
                session: {
                    id: session.id,
                    expiresAt: session.expiresAt,
                }
            }, { status: 200 });
        } else {
            return NextResponse.json({ user: null, session: null }, { status: 401 });
        }
    } catch (error) {
        console.error("Error in /api/auth/status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
