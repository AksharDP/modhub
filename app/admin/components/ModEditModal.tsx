"use client";

import { useState, useEffect } from "react";

interface ModEditModalProps {
    modId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    games: { id: number; name: string }[];
    categories: { id: number; name: string }[];
}

interface Mod {
    title?: string;
    description?: string;
    version?: string;
    imageUrl?: string | null;
    downloadUrl?: string | null;
    size?: string;
    gameId?: number;
    categoryId?: number;
}

export default function ModEditModal({
    modId,
    isOpen,
    onClose,
    onSuccess,
    games,
    categories,
}: ModEditModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        version: "",
        imageUrl: "",
        downloadUrl: "",
        size: "",
        gameId: 0,
        categoryId: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mod, setMod] = useState<Mod | null>(null);

    useEffect(() => {
        if (!isOpen || !modId) return;
        setIsLoading(true);
        setError(null);
        fetch(`/api/admin/mods/${modId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load mod");
                return res.json();
            })
            .then((data) => {
                setMod(data);
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    version: data.version || "",
                    imageUrl: data.imageUrl || "",
                    downloadUrl: data.downloadUrl || "",
                    size: data.size || "",
                    gameId: data.gameId || 0,
                    categoryId: data.categoryId || 0,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [isOpen, modId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);
        const updateData: Record<string, unknown> = { modId };
        if (formData.title !== mod?.title) updateData.title = formData.title;
        if (formData.description !== mod?.description)
            updateData.description = formData.description;
        if (formData.version !== mod?.version)
            updateData.version = formData.version;
        if (formData.imageUrl !== mod?.imageUrl)
            updateData.imageUrl = formData.imageUrl || null;
        if (formData.downloadUrl !== mod?.downloadUrl)
            updateData.downloadUrl = formData.downloadUrl || null;
        if (formData.size !== mod?.size) updateData.size = formData.size;
        if (formData.gameId !== mod?.gameId)
            updateData.gameId = formData.gameId;
        if (formData.categoryId !== mod?.categoryId)
            updateData.categoryId = formData.categoryId;
        try {
            const res = await fetch(`/api/admin/mods/${modId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });
            if (!res.ok) throw new Error("Failed to update mod");
            onSuccess();
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to update mod");
            } else {
                setError("Failed to update mod");
            }
        } finally {
            setIsPending(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "gameId" || name === "categoryId"
                    ? parseInt(value) || 0
                    : value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Edit Mod</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="text-red-500 text-sm mb-2">{error}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Version *
                                    </label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={formData.version}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Size
                                    </label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 2.5 MB"
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Download URL
                                </label>
                                <input
                                    type="url"
                                    name="downloadUrl"
                                    value={formData.downloadUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/download"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Game *
                                    </label>
                                    <select
                                        name="gameId"
                                        value={formData.gameId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                                    >
                                        <option value={0}>Select a game</option>
                                        {games?.map((game) => (
                                            <option
                                                key={game.id}
                                                value={game.id}
                                            >
                                                {game.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-400"
                                    >
                                        <option value={0}>
                                            Select a category
                                        </option>
                                        {categories?.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
