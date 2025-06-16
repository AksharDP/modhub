export default function CollectionsModalLoading() {
    return (
        <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
                <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg animate-pulse"
                >
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                    <div className="flex-grow">
                        <div className="h-4 bg-gray-700 rounded mb-1 w-32"></div>
                        <div className="h-3 bg-gray-700 rounded w-48"></div>
                    </div>
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                </div>
            ))}
        </div>
    );
}
