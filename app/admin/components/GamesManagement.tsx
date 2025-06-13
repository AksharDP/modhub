"use client";

import { useState } from "react";
import { trpc } from "../../lib/trpc";
import Image from "next/image";
import type { FormField } from "../../db/schema";
import GameEditor from "./GameEditor";

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

export default function GamesManagement() {
    const [selectedGame, setSelectedGame] = useState<GameWithSerializedDates | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const { data: games, isLoading, refetch } = trpc.admin.getGames.useQuery();
    console.log(games);
    const deleteGameMutation = trpc.admin.deleteGame.useMutation({
        onSuccess: () => {
            refetch();
        },
    });

    const handleCreateGame = () => {
        setSelectedGame(null);
        setIsEditorOpen(true);
    };    const handleEditGame = (game: GameWithSerializedDates) => {
        setSelectedGame(game);
        setIsEditorOpen(true);
    };const handleDeleteGame = async (gameId: number) => {
        if (confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
            try {
                await deleteGameMutation.mutateAsync({ gameId });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to delete game";
                alert(errorMessage);
            }
        }
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setSelectedGame(null);
        refetch();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Game Management</h2>
                <button
                    onClick={handleCreateGame}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                    + Add New Game
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games?.map((game) => (
                    <div
                        key={game.id}
                        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
                    >
                        {game.imageUrl && (
                            <div className="relative h-48 w-full">
                                <Image
                                    src={game.imageUrl}
                                    alt={game.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {game.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-2">
                                        Slug: {game.slug}
                                    </p>
                                    {game.description && (
                                        <p className="text-gray-300 text-sm">
                                            {game.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex gap-2 mb-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            game.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {game.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400">
                                    <p>
                                        Users: {game.visibleToUsers ? "Visible" : "Hidden"}
                                    </p>
                                    <p>
                                        Supporters: {game.visibleToSupporters ? "Visible" : "Hidden"}
                                    </p>
                                    <p>
                                        Form Fields: {game.formSchema?.length || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditGame(game)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200 cursor-pointer"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteGame(game.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors duration-200 cursor-pointer"
                                    disabled={deleteGameMutation.isPending}
                                >
                                    {deleteGameMutation.isPending ? "..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {games && games.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                        No games found
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Create your first game to get started
                    </p>
                    <button
                        onClick={handleCreateGame}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                        Add Your First Game
                    </button>
                </div>
            )}

            {isEditorOpen && (
                <GameEditor
                    game={selectedGame}
                    onClose={handleCloseEditor}
                />
            )}
        </div>
    );
}