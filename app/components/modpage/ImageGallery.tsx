import Image from "next/image";
import React from "react";

interface ImageGalleryProps {
    mod: {
        allImageUrls: string[];
        title: string;
    };
    currentImageIndex: number;
    setCurrentImageIndex: (index: number) => void;
    prevImage: () => void;
    nextImage: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
    mod,
    currentImageIndex,
    setCurrentImageIndex,
    prevImage,
    nextImage,
}) => {
    if (!mod.allImageUrls || mod.allImageUrls.length === 0) {
        return (
            <div className="relative w-full h-96 mb-6 bg-gray-800 rounded-[5px] shadow-lg flex items-center justify-center text-gray-500">
                No images available.
            </div>
        );
    }

    return (
        <div className="relative w-full h-96 mb-6 bg-gray-800 rounded-[5px] shadow-lg group">
            <Image
                key={mod.allImageUrls[currentImageIndex]}
                src={mod.allImageUrls[currentImageIndex]}
                alt={`${mod.title} - image ${currentImageIndex + 1}`}
                layout="fill"
                objectFit="contain"
                className="rounded-[5px]"
                loading="lazy"
            />
            {mod.allImageUrls.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white p-3 rounded-full hover:bg-purple-600 hover:bg-opacity-90 focus:outline-none transition-all duration-150 ease-in-out opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white p-3 rounded-full hover:bg-purple-600 hover:bg-opacity-90 focus:outline-none transition-all duration-150 ease-in-out opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </>
            )}
            {mod.allImageUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {mod.allImageUrls.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full ${
                                // Slightly smaller dots
                                currentImageIndex === index
                                    ? "bg-purple-500 opacity-100" // Active dot
                                    : "bg-gray-500 opacity-50 hover:opacity-75" // Inactive dot
                            } focus:outline-none transition-all duration-150 ease-in-out`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
