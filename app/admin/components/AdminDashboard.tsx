"use client";

import { useState } from "react";
import StatsOverview from "./StatsOverview";
import UserManagement from "./UserManagement";
import ModManagement from "./ModManagement";
import GamesManagement from "./GamesManagement";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "mods" | "games">(
        "overview"
    );

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
            </div>            <div className="mt-6">
                {activeTab === "overview" && <StatsOverview />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "mods" && <ModManagement />}
                {activeTab === "games" && <GamesManagement />}
            </div>
        </div>
    );
}
