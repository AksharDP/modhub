"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const UserProfileHeader = dynamic(() => import("../components/UserProfileHeader"));
const UserStats = dynamic(() => import("../components/UserStats"));
const UserModsSection = dynamic(() => import("../components/UserModsSection"));
const UserCollectionsWrapper = dynamic(() => import("../components/UserCollectionsWrapper"));

function UserProfileHeaderFallback() {
    return <div className="h-32 bg-gray-800 rounded-lg animate-pulse mb-4" />;
}
function UserStatsFallback() {
    return <div className="h-24 bg-gray-800 rounded-lg animate-pulse mb-4" />;
}
function UserModsSectionFallback() {
    return <div className="h-64 bg-gray-800 rounded-lg animate-pulse mb-4" />;
}
function UserCollectionsFallback() {
    return <div className="h-48 bg-gray-800 rounded-lg animate-pulse mb-4" />;
}

export default function ProfileClientSections({
    userHeader,
    createdAtFormatted,
    modCount,
    activeModCount,
    featuredModCount,
    reviewCount,
    userModsClean,
    userId
}: {
    userHeader: {
        username: string;
        profilePicture?: string;
        bio?: string;
        createdAt?: string | Date;
        role: string;
    };
    createdAtFormatted: string;
    modCount: number;
    activeModCount: number;
    featuredModCount: number;
    reviewCount: number;
    userModsClean: Array<{
        id: number;
        title: string;
        description: string;
        version: string;
        imageUrl?: string;
        createdAt: string | Date;
        updatedAt: string | Date;
        isActive: boolean;
        isFeatured: boolean;
    }>;
    userId: number;
}) {
    return (
        <>
            <Suspense fallback={<UserProfileHeaderFallback />}>
                <UserProfileHeader user={userHeader} createdAtFormatted={createdAtFormatted} />
            </Suspense>
            <Suspense fallback={<UserStatsFallback />}>
                <UserStats
                    modCount={modCount}
                    activeModCount={activeModCount}
                    featuredModCount={featuredModCount}
                    reviewCount={reviewCount}
                />
            </Suspense>
            <Suspense fallback={<UserModsSectionFallback />}>
                <UserModsSection userMods={userModsClean} />
            </Suspense>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <Suspense fallback={<UserCollectionsFallback />}>
                    <UserCollectionsWrapper userId={userId} isOwnProfile={true} />
                </Suspense>
            </div>
        </>
    );
}
