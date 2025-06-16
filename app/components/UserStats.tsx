"use client";

interface UserStatsProps {
    modCount: number;
    activeModCount: number;
    featuredModCount: number;
    reviewCount: number;
}

export default function UserStats({ modCount, activeModCount, featuredModCount, reviewCount }: UserStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-blue-400 mb-2">{modCount}</div>
                <div className="text-gray-400">Total Mods</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-green-400 mb-2">{activeModCount}</div>
                <div className="text-gray-400">Active Mods</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{featuredModCount}</div>
                <div className="text-gray-400">Featured Mods</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-purple-400 mb-2">{reviewCount}</div>
                <div className="text-gray-400">Reviews Written</div>
            </div>
        </div>
    );
}
