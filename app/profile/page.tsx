import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth";
import { db } from "../db";
import { mods, userModRatings } from "../db/schema";
import { eq, count } from "drizzle-orm";
import ProfileClientSections from "./ProfileClientSections";

export default async function ProfilePage() {
    const { user } = await getCurrentSession();

    if (!user) {
        redirect("/login");
    }

    const userMods = await db
        .select({
            id: mods.id,
            title: mods.title,
            description: mods.description,
            version: mods.version,
            imageUrl: mods.imageUrl,
            createdAt: mods.createdAt,
            updatedAt: mods.updatedAt,
            isActive: mods.isActive,
            isFeatured: mods.isFeatured,
        })
        .from(mods)
        .where(eq(mods.authorId, user.id));

    // Fix nulls for UserModsSection props
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

    const [reviewCountResult] = await db
        .select({ count: count() })
        .from(userModRatings)
        .where(eq(userModRatings.userId, user.id));

    const reviewCount = reviewCountResult?.count || 0;

    const createdAtFormatted = new Date(user.createdAt || new Date()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Clean up user object for UserProfileHeader
    const userHeader = {
        username: user.username,
        profilePicture: user.profilePicture || undefined,
        bio: user.bio || undefined,
        createdAt: user.createdAt || undefined,
        role: user.role,
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
                    userId={user.id}
                />
            </div>
        </div>
    );
}
