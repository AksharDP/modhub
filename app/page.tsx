import { Suspense } from "react";
import ModsSection from "./components/ModsSection";

export default function Home() {
    return (
        <>
            <main>
                <Suspense fallback={
                    <div className="p-8 text-white">
                        <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
                            Featured Mods
                        </h1>
                        <div className="flex flex-wrap justify-center">
                            {[...Array(8)].map((_, index) => (
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
                    </div>
                }>
                    <ModsSection
                        apiEndpoint="/api/featured-mods"
                        title="Featured Mods"
                        limit={8}
                        showPagination={true}
                        redirectUrl="/"
                        containerClassName="p-8 text-white"
                        headerClassName="mb-8 text-center"
                    />
                </Suspense>
            </main>
        </>
    );
}
