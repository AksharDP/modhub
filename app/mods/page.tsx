"use client";

import NavBar from "@/app/components/nav";
import Card from "@/app/components/card";
import DatabaseError from "@/app/components/DatabaseError";
import { trpc } from "@/app/lib/trpc";

export default function ModsPage() {
    const { data, isLoading, error } = trpc.mod.getMods.useQuery({
        limit: 20,
        offset: 0,
        sortBy: 'created',
        sortOrder: 'desc'
    });

    if (isLoading) {
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
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <p className="mt-2 text-gray-400">Loading mods...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        // Check if it's a database connection error
        const isDatabaseError = error.message.includes('DATABASE_URI') || 
                               error.message.includes('Failed query') || 
                               error.message.includes('connection') ||
                               error.message.includes('does not exist');
        
        if (isDatabaseError) {
            return <DatabaseError error={error.message} />;
        }

        // Generic error fallback
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
                    <div className="text-center text-red-400">
                        <p>Error loading mods: {error.message}</p>
                    </div>
                </main>
            </div>
        );
    }

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
                </header>                {data?.mods && data.mods.length > 0 ? (
                    <div className="flex flex-wrap justify-center">
                        {data.mods.map((mod) => (
                            <Card
                                key={mod.id}
                                modId={mod.id}
                                gameName={mod.game?.slug || 'unknown'}
                                title={mod.title}
                                description={mod.description}
                                imageUrl={mod.imageUrl || "https://placehold.co/300x200/4F46E5/FFFFFF/png?text=Mod"}
                                author={mod.author?.username || 'Unknown'}
                                authorPFP={mod.author?.profilePicture || "https://placehold.co/30x30/7C3AED/FFFFFF/png?text=U"}
                                category={mod.category?.name || 'Other'}
                                likes={mod.stats?.likes || 0}
                                downloads={mod.stats?.totalDownloads || 0}
                                size={mod.size || "N/A"}
                                uploaded={mod.createdAt || ''}
                                lastUpdated={mod.updatedAt || ''}
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
