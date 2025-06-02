import React from 'react';

interface NoModsFoundProps {
    authorName: string;
    selectedGame: string;
    hasAuthorUploadedMods: boolean;
}

const NoModsFound: React.FC<NoModsFoundProps> = ({ authorName, selectedGame, hasAuthorUploadedMods }) => {
    return (
        <div className="text-center py-16 bg-gray-800 rounded-[5px] shadow-lg">
            <svg
                className="mx-auto h-16 w-16 text-gray-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.764m-4.764 4.764a15.995 15.995 0 014.764-4.764m0 0A15.995 15.995 0 0012 3.042a15.995 15.995 0 00-4.764 4.764m0 0a15.995 15.995 0 014.764-4.764"
                />
                <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                {hasAuthorUploadedMods
                    ? "No Mods Found"
                    : "No Mods Yet"}
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
                {hasAuthorUploadedMods
                    ? `We couldn't find any mods by ${authorName} for "${selectedGame}". Try selecting "All Games" or a different game.`
                    : `${authorName} hasn't uploaded any mods yet. Check back later!`}
            </p>
        </div>
    );
};

export default NoModsFound;
