import Card from "./components/card";
import NavBar from "./components/nav";
import mockMods from "./MockModData.json"; // Adjusted path

// Define the Mod interface based on CardProps and available JSON data
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

// Process mockMods to fit the Mod interface
const modsData: Mod[] = mockMods.map((mod) => ({
    modId: mod.id,
    gameName: "featuredgame", // Placeholder or derive if possible
    title: mod.name,
    description: mod.description,
    imageUrl: mod.imageUrl,
    author: mod.author,
    authorPFP: "https://placehold.co/30x30/png", // Placeholder
    category: mod.tags[0] || "General",
    likes: Math.round(mod.rating * 1000), // Example conversion
    downloads: mod.downloads,
    size: "N/A", // Placeholder
    uploaded: new Date(mod.lastUpdated), // Or a different date if available
    lastUpdated: new Date(mod.lastUpdated),
}));

export default function Home() {
    return (
        <>
            <NavBar />
            <main>
                <div className="p-8 text-white flex flex-wrap justify-center">
                    {modsData.slice(0, 4).map((mod) => ( // Displaying first 4 mods as an example
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
