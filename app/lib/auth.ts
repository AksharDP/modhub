import { userTable, User, sessionTable, Session } from "../db/schema";
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { db } from "../db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(
    token: string,
    userId: number
): Promise<Session> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const userSession: Session = {
        id: sessionId,
        userId: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    await db.insert(sessionTable).values(userSession);
    return userSession;
}

export async function validateSessionToken(
    token: string
): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token))
    );
    const result = await db
        .select({ user: userTable, session: sessionTable })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(eq(sessionTable.id, sessionId));

    if (result.length < 1) return { session: null, user: null };

    const { user, session } = result[0];
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db
            .update(sessionTable)
            .set({ expiresAt: session.expiresAt })
            .where(eq(sessionTable.id, session.id));
    }
    return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateAllSessions(userId: number): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function createUser(
    username: string,
    email: string,
    password: string
): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const [user] = await db
        .insert(userTable)
        .values({
            username,
            email,
            passwordHash: hashedPassword,
        })
        .returning();

    return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const users = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));
    return users[0] || null;
}

export async function getUserByUsername(
    username: string
): Promise<User | null> {
    const users = await db
        .select()
        .from(userTable)
        .where(eq(userTable.username, username));
    return users[0] || null;
}

export async function getUserPasswordHash(
    userId: number
): Promise<string | null> {
    const users = await db
        .select({ passwordHash: userTable.passwordHash })
        .from(userTable)
        .where(eq(userTable.id, userId));
    return users[0]?.passwordHash || null;
}

export async function setSessionTokenCookie(
    token: string,
    expiresAt: Date
): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        expires: expiresAt,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
    });
}

export async function deleteSessionTokenCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
        maxAge: 0,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
    });
}

export async function getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value || null;
}

export async function getCurrentSession(): Promise<SessionValidationResult> {
    const token = await getSessionToken();
    if (!token) {
        return { session: null, user: null };
    }
    return await validateSessionToken(token);
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
    return (
        username.length >= 3 &&
        username.length <= 32 &&
        /^[a-zA-Z0-9_-]+$/.test(username)
    );
}

export function isValidPassword(password: string): boolean {
    return password.length >= 8;
}

export function isAdmin(user: User | null): boolean {
    return user?.role === "admin";
}

export function isSupporter(user: User | null): boolean {
    return user?.role === "supporter" || user?.role === "admin";
}

export function hasRole(
    user: User | null,
    role: "admin" | "user" | "supporter"
): boolean {
    if (!user) return false;
    if (role === "admin") return user.role === "admin";
    if (role === "supporter")
        return user.role === "supporter" || user.role === "admin";
    return true;
}

export async function requireRole(
    role: "admin" | "user" | "supporter"
): Promise<User> {
    const { user } = await getCurrentSession();
    if (!user) {
        throw new Error("Authentication required");
    }
    if (!hasRole(user, role)) {
        throw new Error(`${role} role required`);
    }
    return user;
}

export type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };
