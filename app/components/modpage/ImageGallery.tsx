import Image from "next/image";
import React from "react";
import { ImageGalleryProps } from "@/app/types/common";

const ImageGallery: React.FC<ImageGalleryProps> = ({
    modImages,
    currentImageIndex,
    setCurrentImageIndex,
    prevImage,
    nextImage,
}) => {
    if (!modImages.ImageUrls || modImages.ImageUrls.length === 0) {
        return (
            <div className="relative w-full h-96 mb-6 bg-gray-800 rounded-[5px] shadow-lg flex items-center justify-center text-gray-500">
                No images available.
            </div>
        );
    }

    return (
        <>
            <div className="relative w-full h-96 bg-gray-800 rounded-[5px] shadow-lg group">
                <Image
                    key={modImages.ImageUrls[currentImageIndex]}
                    src={modImages.ImageUrls[currentImageIndex]}
                    alt={`${modImages.title} - image ${currentImageIndex + 1}`}
                    fill
                    className="rounded-[5px] object-contain"
                    priority={currentImageIndex === 0}
                />
                {modImages.ImageUrls.length > 1 && (
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
                {modImages.ImageUrls.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {modImages.ImageUrls.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full ${
                                    currentImageIndex === index
                                        ? "bg-purple-500 opacity-100"
                                        : "bg-gray-500 opacity-50 hover:opacity-75"
                                } focus:outline-none transition-all duration-150 ease-in-out`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
            {/* Thumbnail Gallery Start - Moved from page.tsx */}
            {/* {mod.allImageUrls.length > 0 && (
                <div className="grid grid-cols-7 gap-2 mt-2">
                    {mod.allImageUrls.map((url, index) => (
                        <div
                            key={`thumb-wrapper-${index}`}
                            className="relative aspect-square w-full cursor-pointer"
                            onClick={() => setCurrentImageIndex(index)}
                        >
                            <Image
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 15vw, (max-width: 1024px) 10vw, 8vw"
                                className={`object-cover rounded border-2 hover:opacity-80
                                            ${
                                                currentImageIndex === index
                                                    ? "border-blue-500"
                                                    : "border-gray-700"
                                            }`}
                                id={`thumbnail-${index}`}
                            />
                        </div>
                    ))}
                </div>
            )} */}
            {/* Thumbnail Gallery End */}
        </>
    );
};

export default ImageGallery;
