"use client";

import ModsSection from "./ModsSection";

interface AllModsSectionProps {
    limit?: number;
    showPagination?: boolean;
}

export default function AllModsSection({
    limit = 12,
    showPagination = true
}: AllModsSectionProps) {
    return (
        <ModsSection
            apiEndpoint="/api/mods"
            title="Recent Mods"
            subtitle="Explore the latest additions to our modding community."
            limit={limit}
            showPagination={showPagination}
            redirectUrl="/mods"
            containerClassName="bg-gray-900 min-h-screen flex flex-col"
            headerClassName="mb-8 text-center"
        />
    );
}
