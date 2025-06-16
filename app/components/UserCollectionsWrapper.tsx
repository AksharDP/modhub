"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import UserCollectionsLoading from "./UserCollectionsLoading";

const UserCollections = dynamic(() => import("./UserCollections"), {
    ssr: false,
    loading: () => <UserCollectionsLoading />
});

interface UserCollectionsWrapperProps {
    userId?: number;
    isOwnProfile?: boolean;
}

export default function UserCollectionsWrapper({ userId, isOwnProfile = false }: UserCollectionsWrapperProps) {
    return (
        <Suspense fallback={<UserCollectionsLoading />}>
            <UserCollections userId={userId} isOwnProfile={isOwnProfile} />
        </Suspense>
    );
}
