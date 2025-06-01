import React from 'react';

interface DescriptionSectionProps {
  mod: any; // Replace 'any' with a more specific type
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ mod }) => {
  return (
    <article className="prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none bg-gray-800 p-6 rounded-lg shadow">
      <div
        dangerouslySetInnerHTML={{
          __html: mod.fullDescription,
        }}
      />
    </article>
  );
};

export default DescriptionSection;
