"use client";

import { useState } from "react";

interface SystemSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SystemSettingsModal({ isOpen, onClose }: SystemSettingsModalProps) {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        // Simulate save operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        alert("Settings saved successfully!");
        onClose();
    };

    const tabs = [
        { id: "general", label: "General", icon: "⚙️" },
        { id: "uploads", label: "Uploads", icon: "📤" },
        { id: "moderation", label: "Moderation", icon: "🛡️" },
        { id: "notifications", label: "Notifications", icon: "🔔" }
    ];    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if clicking the background, not the modal content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackgroundClick}
        >
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">System Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex h-[600px]">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-900 border-r border-gray-700">
                        <nav className="p-4 space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        w-full text-left p-3 rounded-lg transition-colors
                                        ${activeTab === tab.id 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeTab === "general" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">General Settings</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Site Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="ModHub"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Site Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            defaultValue="A platform for game modifications"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="maintenance"
                                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="maintenance" className="text-gray-300">
                                            Enable maintenance mode
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "uploads" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">Upload Settings</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Max File Size (MB)
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue="500"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Allowed File Types
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue=".zip,.rar,.7z"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="autoApprove"
                                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="autoApprove" className="text-gray-300">
                                            Auto-approve uploads from trusted users
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "moderation" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">Moderation Settings</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="requireApproval"
                                            defaultChecked
                                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="requireApproval" className="text-gray-300">
                                            Require admin approval for new mods
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="enableReports"
                                            defaultChecked
                                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="enableReports" className="text-gray-300">
                                            Enable user reporting system
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Auto-moderation keywords (comma-separated)
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="spam, hack, cheat"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailNewMods"
                                            defaultChecked
                                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="emailNewMods" className="text-gray-300">
                                            Email notifications for new mod submissions
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailReports"
                                            defaultChecked
                                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="emailReports" className="text-gray-300">
                                            Email notifications for user reports
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Admin Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="admin@modhub.com"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
