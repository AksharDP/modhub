import { NextResponse } from "next/server";
import { getCurrentSession } from "@/app/lib/auth";

export async function GET() {
    try {
        const { user } = await getCurrentSession();
        
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
