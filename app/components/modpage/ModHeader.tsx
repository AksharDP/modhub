import React from "react";
import Image from "next/image";
import { ModInterface } from "@/app/types/common";

interface ModHeaderProps {
    mod: ModInterface;
    gamename: string;
}

const ModHeader: React.FC<ModHeaderProps> = ({ mod, gamename }) => {
    return (
        <header className="mb-6 border-b border-gray-700 pb-4">
            <h1 className="text-4xl font-bold text-purple-400 mb-3">
                {mod.title}
            </h1>
            <p className="text-sm text-gray-500 mb-3">
                Game: {gamename}
            </p>
            <div className="flex items-center text-sm text-gray-300">
                <Image
                    src={mod.authorPFP}
                    alt={`${mod.author}'s profile picture`}
                    width={24}
                    height={24}
                    className="rounded-[5px] mr-2"
                />
                <span>
                    By{" "}
                    <span className="font-semibold text-gray-200">
                        {mod.author}
                    </span>
                </span>
                <span className="mx-2">|</span>
                <span>
                    Category:{" "}
                    {Array.isArray(mod.category) ? (
                        mod.category.map((cat, idx) => (
                            <span key={cat}>
                                <a
                                    href={`/categories/${cat.toLowerCase()}`}
                                    className="text-purple-300 hover:underline font-semibold"
                                >
                                    {cat}
                                </a>
                                {idx < (mod.category as string[]).length - 1 ? ', ' : ''}
                            </span>
                        ))
                    ) : (
                        <a
                            href={`/categories/${(mod.category as string).toLowerCase()}`}
                            className="text-purple-300 hover:underline font-semibold"
                        >
                            {mod.category}
                        </a>
                    )}
                </span>
            </div>
        </header>
    );
};

export default ModHeader;
