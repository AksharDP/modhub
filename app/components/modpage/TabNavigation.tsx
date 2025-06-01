import React from "react";

interface TabNavigationProps {
    activeTab: "description" | "files";
    setActiveTab: (tab: "description" | "files") => void;
    fileCount: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
    activeTab,
    setActiveTab,
    fileCount,
}) => {
    return (
        <div className="border-b border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab("description")}
                    className={`${
                        activeTab === "description"
                            ? "border-purple-500 text-purple-300"
                            : "border-transparent text-gray-500 hover:text-gray-100 hover:border-gray-500"
                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-base transition-colors duration-150 ease-in-out focus:outline-none`}
                    aria-current={
                        activeTab === "description" ? "page" : undefined
                    }
                >
                    Description
                </button>
                <button
                    onClick={() => setActiveTab("files")}
                    className={`${
                        activeTab === "files"
                            ? "border-purple-500 text-purple-300"
                            : "border-transparent text-gray-500 hover:text-gray-100 hover:border-gray-500"
                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-base transition-colors duration-150 ease-in-out focus:outline-none`}
                    aria-current={activeTab === "files" ? "page" : undefined}
                >
                    Files ({fileCount})
                </button>
            </nav>
        </div>
    );
};

export default TabNavigation;
