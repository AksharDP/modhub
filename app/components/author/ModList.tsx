import Card from "@/app/components/card";
import { Mod } from "@/app/author/[author]/mods/page"; // Assuming Mod interface is exported from page.tsx


interface ModListProps {
    mods: Mod[];
}

const ModList: React.FC<ModListProps> = ({ mods }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mods.map((mod) => (
                <Card
                    key={`${mod.gameName}-${mod.modId}`}
                    modId={mod.modId}
                    gameName={mod.gameName}
                    title={mod.title}
                    description={mod.description}
                    imageUrl={mod.imageUrl}
                    author={mod.author}
                    authorPFP={mod.authorPFP}
                    category={mod.category}
                    likes={mod.likes}
                    downloads={mod.downloads}
                    size={mod.size}
                    uploaded={mod.uploaded}
                    lastUpdated={mod.lastUpdated}
                />
            ))}
        </div>
    );
};

export default ModList;
