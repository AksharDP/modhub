import React from "react";

interface FileVersion {
    id: string;
    version: string;
    fileName: string;
    fileSize: string;
    uploadDate: string | number | Date;
    downloadUrl: string;
    changelog?: string;
    isLatest: boolean;
}

interface ModWithFileVersions {
    fileVersions: FileVersion[];
}

interface FilesSectionProps {
    mod: ModWithFileVersions;
    gamename: string;
    modid: string;
    formatDate: (date: string | number | Date) => string;
}

const ChevronDownIcon = () => (
    <svg
        className="w-4 h-4 inline-block mr-1 group-open:rotate-180 transition-transform duration-150"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
        />
    </svg>
);

const FilesSection: React.FC<FilesSectionProps> = ({ mod, formatDate }) => {
    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
                Available Files
            </h2>
            <div className="space-y-6">
                {mod.fileVersions
                    .sort(
                        (a: FileVersion, b: FileVersion) =>
                            new Date(b.uploadDate).getTime() -
                            new Date(a.uploadDate).getTime()
                    )
                    .map((file: FileVersion) => (
                        <div
                            key={file.id}
                            className={`rounded-md shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out p-5 ${
                                // Base padding p-5
                                file.isLatest
                                    ? "bg-gray-700 border-l-4 border-purple-500"
                                    : "bg-gray-750"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                                <h3 className="text-lg font-medium text-purple-400 mb-2 sm:mb-0">
                                    {file.fileName}{" "}
                                    {file.isLatest && (
                                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full ml-2 align-middle">
                                            Latest
                                        </span>
                                    )}
                                </h3>
                                <a
                                    href={file.downloadUrl}
                                    className="mt-2 sm:mt-0 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
                                >
                                    Download
                                </a>
                            </div>
                            <div className="text-xs text-gray-400 space-y-0.5 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-1 mb-2">
                                <span>
                                    Version:{" "}
                                    <span className="text-gray-300">
                                        {file.version}
                                    </span>
                                </span>
                                <span>
                                    Size:{" "}
                                    <span className="text-gray-300">
                                        {file.fileSize}
                                    </span>
                                </span>
                                <span>
                                    Uploaded:{" "}
                                    <span className="text-gray-300">
                                        {formatDate(file.uploadDate)}
                                    </span>
                                </span>
                            </div>
                            {file.changelog && (
                                <details className="mt-3 text-sm group">
                                    <summary className="cursor-pointer text-gray-300 hover:text-white list-none flex items-center focus:outline-none py-1">
                                        <ChevronDownIcon />
                                        View Changelog
                                    </summary>
                                    <div className="mt-2 p-3 bg-black bg-opacity-20 border border-gray-700 rounded text-gray-300 whitespace-pre-wrap text-xs">
                                        {file.changelog}
                                    </div>
                                </details>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};
export default FilesSection;
