"use client";

import { useState } from "react";
import StatsOverview from "./StatsOverview";
import UserManagement from "./UserManagement";
import ModManagement from "./ModManagement";
import GamesManagement from "./GamesManagement";
import type { User } from "@/app/db/schema";
import type { ModWithRelations, ModPagination } from "./ModManagement";
import type { GameWithSerializedDates } from "./GamesManagement";

interface AdminDashboardProps {
    initialStats: {
        users: number;
        mods: number;
        activeMods: number;
        featuredMods: number;
        games: number;
        categories: number;
        totalDownloads: number;
    };
    initialUsers: User[];
    initialUserPagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
    initialMods: ModWithRelations[];
    initialModPagination: ModPagination;
    initialGames: GameWithSerializedDates[];
    games: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}

export default function AdminDashboard({
    initialStats,
    initialUsers,
    initialUserPagination,
    initialMods,
    initialModPagination,
    initialGames,
    games,
    categories,
}: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<
        "overview" | "users" | "mods" | "games"
    >("overview");

    const tabs = [
        { id: "overview" as const, label: "Overview", icon: "📊" },
        { id: "users" as const, label: "User Management", icon: "👥" },
        { id: "mods" as const, label: "Mod Management", icon: "🎮" },
        { id: "games" as const, label: "Game Management", icon: "🎯" },
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer
                ${
                    activeTab === tab.id
                        ? "border-orange-400 text-orange-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }
              `}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === "overview" && (
                    <StatsOverview initialStats={initialStats} />
                )}
                {activeTab === "users" && (
                    <UserManagement users={initialUsers} pagination={initialUserPagination} />
                )}
                {activeTab === "mods" && (
                    <ModManagement
                        initialMods={initialMods}
                        initialPagination={initialModPagination}
                        games={games}
                        categories={categories}
                    />
                )}
                {activeTab === "games" && (
                    <GamesManagement initialGames={initialGames} />
                )}
            </div>
        </div>
    );
}
