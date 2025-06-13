"use client";

import { useState, useEffect } from "react";
import { trpc } from "../../lib/trpc";
import Image from "next/image";
import FormBuilder, { FormField } from './FormBuilder';

// Define the type that matches what tRPC returns (with serialized dates)
type GameWithSerializedDates = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean | null;
    visibleToUsers: boolean | null;
    visibleToSupporters: boolean | null;
    formSchema: FormField[] | null;
    createdAt: string | null;
    updatedAt: string | null;
};

interface GameEditorProps {
    game: GameWithSerializedDates | null;
    onClose: () => void;
}

export default function GameEditor({ game, onClose }: GameEditorProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [visibleToUsers, setVisibleToUsers] = useState(true);
    const [visibleToSupporters, setVisibleToSupporters] = useState(true);
    const [formSchema, setFormSchema] = useState<FormField[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'visibility' | 'form'>('basic');
    
    const utils = trpc.useUtils();

    const createGameMutation = trpc.admin.createGame.useMutation({
        onSuccess: () => {
            utils.admin.getGames.invalidate();
            onClose();
        },
        onError: (error) => {
            alert(error.message || "Failed to create game");
        }
    });

    const updateGameMutation = trpc.admin.updateGame.useMutation({
        onSuccess: () => {
            utils.admin.getGames.invalidate();
            onClose();
        },
        onError: (error) => {
            alert(error.message || "Failed to update game");
        }
    });    useEffect(() => {
        if (game) {
            setName(game.name);
            setSlug(game.slug);
            setDescription(game.description || "");
            setImageUrl(game.imageUrl || "");
            setIsActive(game.isActive ?? true);
            setVisibleToUsers(game.visibleToUsers ?? true);
            setVisibleToSupporters(game.visibleToSupporters ?? true);
            
            // Safely parse formSchema
            const parsedSchema = Array.isArray(game.formSchema) ? game.formSchema as FormField[] : [];
            setFormSchema(parsedSchema);
        } else {
            // Reset for new game
            setName("");
            setSlug("");
            setDescription("");
            setImageUrl("");
            setIsActive(true);
            setVisibleToUsers(true);
            setVisibleToSupporters(true);
            setFormSchema([]);
        }
    }, [game]);

    // Auto-generate slug from name
    const handleNameChange = (newName: string) => {
        setName(newName);
        if (!game) { // Only auto-generate slug for new games
            const newSlug = newName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setSlug(newSlug);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            alert("Game name is required");
            return;
        }
        
        if (!slug.trim()) {
            alert("Game slug is required");
            return;
        }

        const gameData = {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            visibleToUsers,
            visibleToSupporters,
            formSchema
        };        try {
            if (game) {
                await updateGameMutation.mutateAsync({ id: game.id, ...gameData, isActive });
            } else {
                await createGameMutation.mutateAsync(gameData);
            }
        } catch {
            // Error handling is done in mutation onError
        }
    };

    const tabs = [
        { id: 'basic' as const, label: 'Basic Info', icon: '📝' },
        { id: 'visibility' as const, label: 'Visibility', icon: '👁️' },
        { id: 'form' as const, label: 'Upload Form', icon: '📋' },
    ];    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-6xl my-4 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">
                        {game ? `Edit "${game.name}"` : "Create New Game"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-3xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? "border-orange-400 text-orange-400"
                                        : "border-transparent text-gray-400 hover:text-gray-300"
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Game Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => handleNameChange(e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none"
                                            required
                                            placeholder="Enter game name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            URL Slug *
                                        </label>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none"
                                            required
                                            placeholder="game-slug"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Used in URLs (lowercase, hyphens only)
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none h-24 resize-none"
                                        placeholder="Brief description of the game"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Game Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none"
                                        placeholder="https://example.com/game-image.jpg"
                                    />                                    {imageUrl && (
                                        <div className="mt-3">
                                            <Image
                                                src={imageUrl}
                                                alt="Game preview"
                                                width={128}
                                                height={80}
                                                className="w-32 h-20 object-cover rounded border border-gray-600"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {game && (
                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={e => setIsActive(e.target.checked)}
                                                className="rounded text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                                            />
                                            <span className="text-gray-300">Game is active</span>
                                        </label>                                        <p className="text-xs text-gray-400 mt-1">
                                            Inactive games won&apos;t appear in lists or be accessible
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'visibility' && (
                            <div className="space-y-6">
                                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Visibility Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleToUsers}
                                                    onChange={e => setVisibleToUsers(e.target.checked)}
                                                    className="rounded text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                                                />
                                                <span className="text-gray-300">Visible to regular users</span>
                                            </label>
                                            <p className="text-xs text-gray-400 mt-1 ml-6">
                                                Regular users can see this game and upload mods for it
                                            </p>
                                        </div>

                                        <div>
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleToSupporters}
                                                    onChange={e => setVisibleToSupporters(e.target.checked)}
                                                    className="rounded text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                                                />
                                                <span className="text-gray-300">Visible to supporters</span>
                                            </label>
                                            <p className="text-xs text-gray-400 mt-1 ml-6">
                                                Supporters can see this game and upload mods for it
                                            </p>
                                        </div>

                                        <div className="bg-gray-800 border border-gray-600 rounded p-4 mt-4">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">Note for Admins</h4>
                                            <p className="text-xs text-gray-400">
                                                As an admin, you can always see and manage all games regardless of visibility settings. 
                                                These settings only affect what regular users and supporters can see.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'form' && (
                            <div className="space-y-4">
                                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">Mod Upload Form Builder</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Customize the form that users see when uploading mods for this game. 
                                        Changes are saved when you save the game.
                                    </p>
                                </div>
                                <FormBuilder schema={formSchema} onChange={setFormSchema} />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-700 p-6 bg-gray-900">
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center"
                                disabled={createGameMutation.isPending || updateGameMutation.isPending}
                            >
                                {(createGameMutation.isPending || updateGameMutation.isPending) && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                {game ? 'Save Changes' : 'Create Game'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
