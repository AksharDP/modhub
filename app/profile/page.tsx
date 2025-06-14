import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth";
import { db } from "../db";
import { mods, userModRatings } from "../db/schema";
import { eq, count } from "drizzle-orm";
import Image from "next/image";

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

    const modCount = userMods.length;
    const activeModCount = userMods.filter((mod) => mod.isActive).length;
    const featuredModCount = userMods.filter((mod) => mod.isFeatured).length;

    const [reviewCountResult] = await db
        .select({ count: count() })
        .from(userModRatings)
        .where(eq(userModRatings.userId, user.id));

    const reviewCount = reviewCountResult?.count || 0;

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative">
                            <Image
                                src={
                                    user.profilePicture ||
                                    "https://placehold.co/128x128/7C3AED/FFFFFF/png?text=" +
                                        user.username.charAt(0).toUpperCase()
                                }
                                alt={`${user.username}'s profile picture`}
                                width={128}
                                height={128}
                                className="rounded-full border-4 border-purple-500 object-cover"
                                unoptimized={
                                    !!user.profilePicture &&
                                    user.profilePicture.startsWith("http")
                                }
                            />
                        </div>
                        <div className="text-center sm:text-left flex-grow">
                            <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">
                                {user.username}
                            </h1>
                            {user.bio && (
                                <p className="text-gray-300 mb-2">{user.bio}</p>
                            )}
                            <p className="text-sm text-gray-500">
                                Member since{" "}
                                {formatDate(user.createdAt || new Date())}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.role === "admin"
                                            ? "bg-red-600 text-red-100"
                                            : user.role === "supporter"
                                            ? "bg-yellow-600 text-yellow-100"
                                            : "bg-gray-600 text-gray-100"
                                    }`}
                                >
                                    {user.role.charAt(0).toUpperCase() +
                                        user.role.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                            {modCount}
                        </div>
                        <div className="text-gray-400">Total Mods</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            {activeModCount}
                        </div>
                        <div className="text-gray-400">Active Mods</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            {featuredModCount}
                        </div>
                        <div className="text-gray-400">Featured Mods</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                            {reviewCount}
                        </div>
                        <div className="text-gray-400">Reviews Written</div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-purple-300">
                        Your Mods
                    </h2>

                    {userMods.length === 0 ? (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-500 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.764m-4.764 4.764a15.995 15.995 0 014.764-4.764m0 0A15.995 15.995 0 0012 3.042a15.995 15.995 0 00-4.764 4.764m0 0a15.995 15.995 0 014.764-4.764"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                No Mods Yet
                            </h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                You haven&apos;t created any mods yet. Start
                                sharing your creativity with the ModHub
                                community!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userMods.map((mod) => (
                                <div
                                    key={mod.id}
                                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors"
                                >
                                    <div className="flex items-start space-x-3">
                                        {mod.imageUrl && (
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={mod.imageUrl}
                                                    alt={mod.title}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-lg object-cover"
                                                    unoptimized={mod.imageUrl.startsWith(
                                                        "http"
                                                    )}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0 flex-grow">
                                                    <h3 className="text-lg font-semibold text-white truncate">
                                                        {mod.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 mb-2">
                                                        v{mod.version}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-1 ml-2">
                                                    {mod.isFeatured && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-600 text-yellow-100">
                                                            Featured
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                            mod.isActive
                                                                ? "bg-green-600 text-green-100"
                                                                : "bg-gray-600 text-gray-100"
                                                        }`}
                                                    >
                                                        {mod.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                                                {mod.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    Created{" "}
                                                    {formatDate(
                                                        mod.createdAt !== null
                                                            ? mod.createdAt
                                                            : new Date()
                                                    )}
                                                </span>
                                                {mod.updatedAt !==
                                                    mod.createdAt && (
                                                    <span>
                                                        Updated{" "}
                                                        {formatDate(
                                                            mod.updatedAt !==
                                                                null
                                                                ? mod.updatedAt
                                                                : new Date()
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
