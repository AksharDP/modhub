"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavigation() {
    const pathname = usePathname();

    const tabs = [
        {
            id: "overview",
            label: "Overview",
            icon: "📊",
            href: "/admin/overview",
        },
        {
            id: "users",
            label: "User Management",
            icon: "👥",
            href: "/admin/users",
        },
        {
            id: "mods",
            label: "Mod Management",
            icon: "🎮",
            href: "/admin/mods",
        },
        {
            id: "games",
            label: "Game Management",
            icon: "🎯",
            href: "/admin/games",
        },
    ];

    return (
        <div className="border-b border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`
                            py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                            ${
                                pathname === tab.href
                                    ? "border-orange-400 text-orange-400"
                                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                            }
                        `}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
