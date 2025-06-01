import React from 'react'; // Added React import
import Image from 'next/image';

interface ModHeaderProps {
  mod: any; // Changed from individual props to 'mod' object to match usage in page.tsx
  gamename: string;
  modid: string;
}

const ModHeader: React.FC<ModHeaderProps> = ({ mod, gamename, modid }) => {
  return (
    <header className="mb-6 border-b border-gray-700 pb-4">
      <h1 className="text-4xl font-bold text-purple-400 mb-3">
        {mod.title}
      </h1>
      <p className="text-sm text-gray-500 mb-3">
        Game: {gamename} | Mod ID: {modid}
      </p>
      <div className="flex items-center text-sm text-gray-300">
        <Image
          src={mod.authorPFP} // Ensure this path is correct
          alt={`${mod.author}'s profile picture`}
          width={24}
          height={24}
          className="rounded-full mr-2"
        />
        <span>By <span className="font-semibold text-gray-200">{mod.author}</span></span>
        <span className="mx-2">|</span>
        <span>
          Category:{" "}
          <a
            href={`/categories/${mod.category.toLowerCase()}`} // Assuming a category link structure
            className="text-purple-300 hover:underline font-semibold"
          >
            {mod.category}
          </a>
        </span>
      </div>
    </header>
  );
};

export default ModHeader;
