import Card from "@/app/components/card";
import { ModInterface } from "@/app/types/common"; // Importing Mod interface from common.ts


interface ModListProps {
    mods: ModInterface[];
}

const ModList: React.FC<ModListProps> = ({ mods }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mods.map((mod) => (
                <Card
                    key={`${mod.game?.slug}-${mod.modId}`} // Updated to use game.slug
                    modId={mod.modId}
                    gameName={mod.game?.name || "Unknown Game"} // Updated to use game.name
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
