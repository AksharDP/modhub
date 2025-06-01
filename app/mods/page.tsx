import NavBar from "@/app/components/nav";
import Card from "@/app/components/card"; // Assuming Card component path

// Define the Mod interface based on CardProps
interface Mod {
    modId: number;
    gameName: string; // This will be used in the URL, so it should be URL-friendly
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

// Placeholder data for mods
const modsData: Mod[] = [
    {
        modId: 1,
        gameName: "skyrim", // Example game name
        title: "Super Cool Sword",
        description: "A very cool sword that does a lot of damage.",
        imageUrl: "https://placehold.co/600x400/png", // Replace with actual image path
        author: "Modder123",
        authorPFP: "https://placehold.co/30x30/png", // Replace with actual image path
        category: "Weapons",
        likes: 1500,
        downloads: 5000,
        size: "10 MB",
        uploaded: new Date("2023-10-01T10:00:00Z"),
        lastUpdated: new Date("2023-10-15T14:30:00Z"),
    },
    {
        modId: 2,
        gameName: "fallout4", // Example game name
        title: "Enhanced Graphics Pack",
        description: "Improves the overall graphics of the game.",
        imageUrl: "https://placehold.co/600x400/png", // Replace with actual image path
        author: "GraphicsGuru",
        authorPFP: "https://placehold.co/30x30/png", // Replace with actual image path
        category: "Visuals",
        likes: 2500,
        downloads: 10000,
        size: "500 MB",
        uploaded: new Date("2023-09-20T08:00:00Z"),
        lastUpdated: new Date("2023-10-20T12:00:00Z"),
    },
    // Add more placeholder mods as needed
];

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
