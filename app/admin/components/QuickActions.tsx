"use client";

import Link from "next/link";
import { useState } from "react";
import SystemSettingsModal from "./SystemSettingsModal";

interface QuickActionLink {
    id: string;
    label: string;
    icon: string;
    color: string;
    href: string;
    description?: string;
    type: 'link';
}

interface QuickActionButton {
    id: string;
    label: string;
    icon: string;
    color: string;
    action: () => void;
    description?: string;
    type: 'button';
}

type QuickAction = QuickActionLink | QuickActionButton;

export default function QuickActions() {
    const [loading, setLoading] = useState<string | null>(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleSystemAction = async (actionId: string, action: () => Promise<void>) => {
        setLoading(actionId);
        try {
            await action();
        } catch (error) {
            console.error(`Error executing ${actionId}:`, error);
            alert(`Failed to execute action. Please try again.`);
        } finally {
            setLoading(null);
        }
    };

    const clearCache = async () => {
        const response = await fetch('/api/admin/system', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'clear-cache' })
        });

        if (!response.ok) {
            throw new Error('Failed to clear cache');
        }

        const result = await response.json();
        alert(result.message || 'Cache cleared successfully!');
    };

    const refreshStats = async () => {
        const response = await fetch('/api/admin/system', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'refresh-stats' })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh stats');
        }

        // Reload the page to show updated stats
        window.location.reload();
    };

    const quickActions: QuickAction[] = [        {
            id: "manage-users",
            label: "Manage Users",
            icon: "👥",
            color: "bg-blue-600",
            description: "View and manage user accounts",
            href: "/admin/users",
            type: 'link'
        },
        {
            id: "review-mods",
            label: "Review Pending Mods",
            icon: "🎮",
            color: "bg-green-600",
            description: "Review mods waiting for approval",
            href: "/admin/mods?filter=pending",
            type: 'link'
        },
        {
            id: "manage-games",
            label: "Manage Games",
            icon: "🕹️",
            color: "bg-purple-600",
            description: "Add or edit games and categories",
            href: "/admin/games",
            type: 'link'
        },
        {
            id: "storage-status",
            label: "Storage Status",
            icon: "☁️",
            color: "bg-indigo-600",
            description: "Check file storage configuration",
            href: "/storage-test",
            type: 'link'
        },
        {
            id: "system-settings",
            label: "System Settings",
            icon: "⚙️",
            color: "bg-gray-600",
            description: "Configure system settings",
            action: () => setShowSettingsModal(true),
            type: 'button'
        },
        {
            id: "clear-cache",
            label: "Clear Cache",
            icon: "🗑️",
            color: "bg-orange-600",
            description: "Clear application cache",
            action: () => handleSystemAction("clear-cache", clearCache),
            type: 'button'
        },
        {
            id: "refresh-stats",
            label: "Refresh Stats",
            icon: "🔄",
            color: "bg-teal-600",
            description: "Refresh dashboard statistics",
            action: () => handleSystemAction("refresh-stats", refreshStats),
            type: 'button'
        }
    ];    return (
        <>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">                    {quickActions.map((action) => {
                        const baseClasses = `
                            text-left p-3 rounded-lg
                            ${action.color}
                            ${loading === action.id 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }
                        `;

                        const content = (
                            <div className="flex items-center space-x-3">
                                <span className="text-lg">
                                    {loading === action.id ? "⏳" : action.icon}
                                </span>
                                <div className="flex-1">
                                    <span className="text-white font-medium">
                                        {action.label}
                                    </span>
                                    {action.description && (
                                        <p className="text-xs text-gray-300 mt-1 opacity-75">
                                            {action.description}
                                        </p>
                                    )}
                                </div>
                                {loading === action.id && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </div>
                        );

                        if (action.type === 'link') {
                            return (
                                <Link
                                    key={action.id}
                                    href={action.href}
                                    className={`${baseClasses} block`}
                                    title={action.description}
                                >
                                    {content}
                                </Link>
                            );                        } else {
                            return (
                                <button
                                    key={action.id}
                                    onClick={action.action}
                                    disabled={loading === action.id}
                                    className={`${baseClasses}`}
                                    title={action.description}
                                >
                                    {content}
                                </button>
                            );
                        }
                    })}
                </div>
            </div>

            <SystemSettingsModal 
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </>
    );
}
