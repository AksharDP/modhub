import { Suspense } from "react";
import GamesClient from "@/app/components/GamesClient";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default function GamesPage() {
    return (
        <Suspense fallback={
            <div className="bg-gray-900 text-white min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <header className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-purple-400">
                            Browse Games
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Discover mods for your favorite games.
                        </p>
                    </header>
                    <div className="flex flex-wrap justify-center">
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-lg overflow-hidden m-2 w-80 animate-pulse"
                            >
                                <div className="w-full h-48 bg-gray-700"></div>
                                <div className="p-5">
                                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <GamesClient />
        </Suspense>
    );
}
