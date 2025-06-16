"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import CollectionsPageLoading from "../components/CollectionsPageLoading";

const CollectionsClient = dynamic(() => import("../components/CollectionsClient"), {
    ssr: false,
    loading: () => <CollectionsPageLoading />
});

export default function CollectionsPage() {
    return (
        <Suspense fallback={<CollectionsPageLoading />}>
            <CollectionsClient />
        </Suspense>
    );
}
