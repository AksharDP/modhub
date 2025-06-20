"use client";

import ModsSection from "./ModsSection";

interface FeaturedModsSectionProps {
    limit?: number;
    showPagination?: boolean;
}

export default function FeaturedModsSection({
    limit = 8,
    showPagination = true
}: FeaturedModsSectionProps) {
    return (
        <ModsSection
            apiEndpoint="/api/featured-mods"
            title="Featured Mods"
            limit={limit}
            showPagination={showPagination}
            redirectUrl="/"
            containerClassName="p-8 text-white"
            headerClassName="mb-8 text-center"
        />
    );
}
