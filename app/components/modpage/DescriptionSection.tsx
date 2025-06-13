import React from "react";

interface Mod {
    Description: string;
}

interface DescriptionSectionProps {
    mod: Mod;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ mod }) => {
    return (
        <article className="prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none bg-gray-800 p-6 rounded-[5px] shadow">
            <div
                dangerouslySetInnerHTML={{
                    __html: mod.Description,
                }}
            />
        </article>
    );
};

export default DescriptionSection;
