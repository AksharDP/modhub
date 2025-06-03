import Card from "./components/card";
import NavBar from "./components/nav";
import mockMods from "./MockModData.json";

interface Mod {
    modId: number;
    gameName: string;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    authorPFP: string;
    category: string;
    likes: number;
    downloads: number;
    size: string;
    uploaded: string | number | Date;
    lastUpdated: string | number | Date;
}

const modsData: Mod[] = mockMods.map((mod) => ({
    modId: mod.id,
    gameName: "featuredgame",
    title: mod.name,
    description: mod.description,
    imageUrl: mod.imageUrl,
    author: mod.author,
    authorPFP: "https://placehold.co/30x30/png",
    category: mod.tags[0] || "General",
    likes: Math.round(mod.rating * 1000),
    downloads: mod.downloads,
    size: "N/A",
    uploaded: new Date(mod.lastUpdated),
    lastUpdated: new Date(mod.lastUpdated),
}));

export default function Home() {
    return (
        <>
            <NavBar />
            <main>
                <div className="p-8 text-white flex flex-wrap justify-center">
                    {modsData.slice(0, 4).map((mod) => (
                        <Card
                            key={mod.modId}
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
            </main>
        </>
    );
}
