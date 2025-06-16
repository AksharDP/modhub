import { db } from "@/app/db";
import { mods, userTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import ProfileClientSections from "../ProfileClientSections";

export default async function ProfileUsernamePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    if (!username) return <div className="text-white p-8">User not found.</div>;
    const decodedUsername = decodeURIComponent(username);
    const [profileUser] = await db.select().from(userTable).where(eq(userTable.username, decodedUsername));
    if (!profileUser) return <div className="text-white p-8">User not found.</div>;

    const userMods = await db.select({
        id: mods.id,
        title: mods.title,
        description: mods.description,
        version: mods.version,
        imageUrl: mods.imageUrl,
        createdAt: mods.createdAt,
        updatedAt: mods.updatedAt,
        isActive: mods.isActive,
        isFeatured: mods.isFeatured,
    }).from(mods).where(eq(mods.authorId, profileUser.id));

    const userModsClean = userMods.map((mod) => ({
        ...mod,
        imageUrl: mod.imageUrl || undefined,
        createdAt: mod.createdAt || new Date(),
        updatedAt: mod.updatedAt || new Date(),
        isActive: mod.isActive ?? false,
        isFeatured: mod.isFeatured ?? false,
    }));

    const modCount = userMods.length;
    const activeModCount = userMods.filter((mod) => mod.isActive).length;
    const featuredModCount = userMods.filter((mod) => mod.isFeatured).length;

    // You may want to fetch review count for this user if needed
    const reviewCount = 0;

    const createdAtFormatted = new Date(profileUser.createdAt || new Date()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const userHeader = {
        username: profileUser.username,
        profilePicture: profileUser.profilePicture || undefined,
        bio: profileUser.bio || undefined,
        createdAt: profileUser.createdAt || undefined,
        role: profileUser.role,
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                <ProfileClientSections
                    userHeader={userHeader}
                    createdAtFormatted={createdAtFormatted}
                    modCount={modCount}
                    activeModCount={activeModCount}
                    featuredModCount={featuredModCount}
                    reviewCount={reviewCount}
                    userModsClean={userModsClean}
                    userId={profileUser.id}
                />
            </div>
        </div>
    );
}
