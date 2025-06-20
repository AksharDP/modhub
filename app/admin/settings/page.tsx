
"use client";

import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        maxModFileSize: 0,
        maxImagesPerMod: 0,
        maxTotalImageSize: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/admin/settings');
                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }
                const data = await response.json();
                setSettings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update settings');
            }
            setSuccess('Settings updated successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">System Settings</h1>
            {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
            {success && <div className="bg-green-500 text-white p-3 rounded-md mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-6 bg-card-bg p-6 shadow-md rounded-card max-w-xl mx-auto">
                <div>
                    <label htmlFor="maxModFileSize" className="block text-sm font-medium text-foreground mb-1">
                        Max Mod File Size (MB)
                    </label>
                    <input
                        type="number"
                        name="maxModFileSize"
                        id="maxModFileSize"
                        value={settings.maxModFileSize}
                        onChange={handleChange}
                        className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-primary focus:border-primary rounded-global p-2 bg-gray-700 text-input-foreground"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="maxImagesPerMod" className="block text-sm font-medium text-foreground mb-1">
                        Max Images Per Mod
                    </label>
                    <input
                        type="number"
                        name="maxImagesPerMod"
                        id="maxImagesPerMod"
                        value={settings.maxImagesPerMod}
                        onChange={handleChange}
                        className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-primary focus:border-primary rounded-global p-2 bg-gray-700 text-input-foreground"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="maxTotalImageSize" className="block text-sm font-medium text-foreground mb-1">
                        Max Total Image Size (MB)
                    </label>
                    <input
                        type="number"
                        name="maxTotalImageSize"
                        id="maxTotalImageSize"
                        value={settings.maxTotalImageSize}
                        onChange={handleChange}
                        className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-primary focus:border-primary rounded-global p-2 bg-gray-700 text-input-foreground"
                        required
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent bg-purple-700 rounded-global shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
