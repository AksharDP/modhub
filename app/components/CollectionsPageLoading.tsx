export default function CollectionsPageLoading() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400">
                        Browse Collections
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Discover curated mod collections from the community.
                    </p>
                </header>
                
                <div className="flex flex-wrap justify-center">
                    {[...Array(12)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-lg overflow-hidden m-2 w-80 animate-pulse"
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-6 bg-gray-700 rounded w-40"></div>
                                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                </div>
                                <div className="h-4 bg-gray-700 rounded mb-3"></div>
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                                </div>
                                <div className="h-10 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
