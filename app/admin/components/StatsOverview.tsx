"use client";

import { useState } from "react";
import QuickActions from "./QuickActions";

interface StatCard {
    title: string;
    value: number;
    icon: string;
    color: string;
}

interface StatsOverviewProps {
    initialStats: {
        users: number;
        mods: number;
        activeMods: number;
        featuredMods: number;
        games: number;
        categories: number;
        totalDownloads: number;
    };
}

export default function StatsOverview({ initialStats }: StatsOverviewProps) {
    const [stats] = useState(initialStats);

    const statCards: StatCard[] = [
        {
            title: "Total Users",
            value: stats.users,
            icon: "👥",
            color: "from-blue-500 to-blue-600",
        },
        {
            title: "Total Mods",
            value: stats.mods,
            icon: "🎮",
            color: "from-green-500 to-green-600",
        },
        {
            title: "Active Mods",
            value: stats.activeMods,
            icon: "✅",
            color: "from-emerald-500 to-emerald-600",
        },
        {
            title: "Featured Mods",
            value: stats.featuredMods,
            icon: "⭐",
            color: "from-yellow-500 to-yellow-600",
        },
        {
            title: "Total Games",
            value: stats.games,
            icon: "🕹️",
            color: "from-purple-500 to-purple-600",
        },
        {
            title: "Categories",
            value: stats.categories,
            icon: "📁",
            color: "from-indigo-500 to-indigo-600",
        },
        {
            title: "Total Downloads",
            value: stats.totalDownloads,
            icon: "⬇️",
            color: "from-orange-500 to-orange-600",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.title}
                        className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                            <div
                                className={`
                p-3 rounded-lg bg-gradient-to-r ${stat.color}
                text-white text-xl
              `}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Platform Health
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">
                                Active Mod Ratio
                            </span>
                            <span className="text-green-400 font-medium">
                                {stats.mods > 0
                                    ? Math.round(
                                          (stats.activeMods / stats.mods) * 100
                                      )
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">
                                Featured Mod Ratio
                            </span>
                            <span className="text-yellow-400 font-medium">
                                {stats.activeMods > 0
                                    ? Math.round(
                                          (stats.featuredMods /
                                              stats.activeMods) *
                                              100
                                      )
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">
                                Avg Downloads per Mod
                            </span>
                            <span className="text-orange-400 font-medium">
                                {stats.mods > 0
                                    ? Math.round(
                                          stats.totalDownloads / stats.mods
                                      ).toLocaleString()
                                    : 0}
                            </span>
                        </div>
                    </div>
                </div>

                <QuickActions />
            </div>
        </div>
    );
}
