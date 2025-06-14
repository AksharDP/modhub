import { getCurrentSession } from "@/app/lib/auth";
import { db } from "@/app/db";
import { mods, userTable, User } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import AuthorProfileClient from "./AuthorProfileClient";

export default async function AuthorProfilePage({ params }: { params: { author: string } }) {
    const { user: currentUser } = await getCurrentSession();
    const username = decodeURIComponent(params.author);
    const [profileUser] = await db.select().from(userTable).where(eq(userTable.username, username));
    if (!profileUser) return <div className="text-white p-8">User not found.</div>;

    const userMods = await db.select().from(mods).where(eq(mods.authorId, profileUser.id));

    // Convert suspendedUntil to string if present
    const profileUserWithStringSuspendedUntil = {
        ...profileUser,
        suspendedUntil: profileUser.suspendedUntil ? profileUser.suspendedUntil.toISOString() : null,
    } as User & { suspendedUntil: string | null };

    return <AuthorProfileClient currentUser={currentUser} profileUser={profileUserWithStringSuspendedUntil} userMods={userMods} />;
}
