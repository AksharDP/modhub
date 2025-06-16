import { Suspense } from "react";
import ModsClient from "@/app/components/ModsClient";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default function ModsPage() {
    return (
        <Suspense fallback={
            <div className="bg-gray-900 min-h-screen flex flex-col">
                <main className="flex-grow container mx-auto px-4 py-8">
                    <header className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-purple-400">
                            Recent Mods
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Explore the latest additions to our modding community.
                        </p>
                    </header>
                    <div className="flex flex-wrap justify-center">
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={index}
                                className="w-80 h-96 m-4 bg-gray-800 rounded-lg animate-pulse"
                            >
                                <div className="h-48 bg-gray-700 rounded-t-lg"></div>
                                <div className="p-4">
                                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-4"></div>
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full mr-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        }>
            <ModsClient />
        </Suspense>
    );
}
