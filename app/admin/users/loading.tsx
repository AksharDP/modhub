import React from "react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mb-4"></div>
            <div className="text-orange-300 text-lg font-semibold">
                Loading users...
            </div>
        </div>
    );
}
