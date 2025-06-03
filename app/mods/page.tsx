import NavBar from "@/app/components/nav";
import Card from "@/app/components/card"; // Assuming Card component path
import mockMods from "@/app/MockModData.json"; // Import the JSON data

// Define the Mod interface based on CardProps and available JSON data
interface Mod {
    modId: number;
    gameName: string; // This will be used in the URL, so it should be URL-friendly
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    authorPFP: string;
    category: string;
    likes: number; // Corresponds to rating * some factor, or a default
    downloads: number;
    size: string; // Placeholder, as not in JSON
    uploaded: string | number | Date; // Corresponds to lastUpdated or a fixed date
    lastUpdated: string | number | Date;
}

// Process mockMods to fit the Mod interface
const modsData: Mod[] = mockMods.map((mod) => ({
    modId: mod.id,
    gameName: "genericgame", // Placeholder, as not in JSON, or derive from tags/name
    title: mod.name,
    description: mod.description,
    imageUrl: mod.imageUrl,
    author: mod.author,
    authorPFP: "https://placehold.co/30x30/png", // Placeholder, as not in JSON
    category: mod.tags[0] || "General", // Use first tag as category or a default
    likes: Math.round(mod.rating * 100), // Example conversion from rating
    downloads: mod.downloads,
    size: "N/A", // Placeholder, as not in JSON
    uploaded: new Date(mod.lastUpdated), // Assuming lastUpdated can serve as uploaded for now
    lastUpdated: new Date(mod.lastUpdated),
}));

export default function ModsPage() {
    return (
        <div className="bg-gray-900 min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Recent Mods
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Explore the latest additions to our modding community.
                    </p>
                </header>
                {modsData.length > 0 ? (
                    <div className="flex flex-wrap justify-center">
                        {modsData.map((mod) => (
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
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        <p className="text-2xl">No mods found.</p>
                        <p>Check back later for new additions!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
