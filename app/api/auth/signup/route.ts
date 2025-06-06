import { NextRequest, NextResponse } from "next/server";
import {
    createUser,
    getUserByUsername,
    getUserByEmail,
    isValidUsername,
    isValidEmail,
    isValidPassword,
} from "../../../lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json();

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        if (!isValidUsername(username)) {
            return NextResponse.json(
                {
                    error: "Username must be 3-32 characters and contain only letters, numbers, hyphens, and underscores",
                },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        if (!isValidPassword(password)) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const existingUserByUsername = await getUserByUsername(username);
        if (existingUserByUsername) {
            return NextResponse.json(
                { error: "Username already taken" },
                { status: 400 }
            );
        }

        const existingUserByEmail = await getUserByEmail(email);
        if (existingUserByEmail) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        const user = await createUser(username, email, password);

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
