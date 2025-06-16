export default function PaginationLoading() {
    return (
        <div className="flex flex-wrap justify-center">
            <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                <div className="flex items-center space-x-2 text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <span>Loading...</span>
                </div>
            </div>
        </div>
    );
}
