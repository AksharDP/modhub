export default function CardSkeleton() {
    return (
        <div className="bg-gray-800 text-white rounded-[var(--border-radius-custom)] shadow-lg m-2 w-80 h-[400px] flex flex-col overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="h-44 w-full bg-gray-700"></div>
            
            {/* Content skeleton */}
            <div className="flex-1 flex flex-col justify-between p-4">
                <div>
                    {/* Title skeleton */}
                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                    {/* Description skeleton */}
                    <div className="h-4 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                </div>
                
                <div className="flex flex-col">
                    {/* Author skeleton */}
                    <div className="flex items-center mt-3 mb-2">
                        <div className="w-6 h-6 bg-gray-700 rounded-full mr-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                    
                    {/* Category badges skeleton */}
                    <div className="flex flex-nowrap gap-2 mt-2 mb-2" style={{ minHeight: "24px", maxHeight: "24px" }}>
                        <div className="h-6 bg-gray-700 rounded w-16"></div>
                        <div className="h-6 bg-gray-700 rounded w-20"></div>
                    </div>
                </div>
                
                {/* Stats skeleton */}
                <div className="flex items-center justify-between text-xs mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-8"></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-12"></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-10"></div>
                    </div>
                </div>
                
                {/* Dates skeleton */}
                <div className="flex items-center justify-between text-xs mt-2">
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}
