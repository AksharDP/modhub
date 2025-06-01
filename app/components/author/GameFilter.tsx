"use client";

import React from "react";

interface GameFilterProps {
    selectedGame: string;
    setSelectedGame: (game: string) => void;
    games: string[];
}

const GameFilter: React.FC<GameFilterProps> = ({
    selectedGame,
    setSelectedGame,
    games,
}) => {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
                Filter by Game
            </h2>
            <div className="flex flex-wrap gap-2">
                {games.map((game) => (
                    <button
                        key={game}
                        onClick={() => setSelectedGame(game)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${
                                selectedGame === game
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                    >
                        {game}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameFilter;
