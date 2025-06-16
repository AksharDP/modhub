export default function UserCollectionsLoading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-700 rounded w-36 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 rounded-lg p-4 animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="h-5 bg-gray-700 rounded w-32"></div>
                            <div className="w-4 h-4 bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="h-4 bg-gray-700 rounded w-16"></div>
                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
