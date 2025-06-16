import { Suspense } from "react";
import FeaturedModsClient from "./components/FeaturedModsClient";
import CardSkeleton from "./components/CardSkeleton";

export default function Home() {
    return (
        <>
            <main>
                <Suspense fallback={
                    <div className="p-8 text-white">
                        <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
                            Featured Mods
                        </h1>                        <div className="flex flex-wrap justify-center">
                            {[...Array(8)].map((_, index) => (
                                <CardSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                }>
                    <FeaturedModsClient />
                </Suspense>
            </main>
        </>
    );
}
