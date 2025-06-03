"use client"; // Required for useState and event handlers

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import NavBar from "../components/nav";

const MAX_IMAGES = 10;

interface ImagePreview {
    file: File;
    url: string;
}

const UploadPage = () => {
    const [title, setTitle] = useState<string>("");
    const [version, setVersion] = useState<string>("");
    const [tags, setTags] = useState<string>(""); // Simple comma-separated tags
    const [description, setDescription] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const [imageError, setImageError] = useState<string>("");

    // Ref to hold the latest selectedImages for cleanup
    const selectedImagesRef = useRef(selectedImages);

    // Effect to update the ref whenever selectedImages changes
    useEffect(() => {
        selectedImagesRef.current = selectedImages;
    }, [selectedImages]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImageError("");
        const files = event.target.files;
        if (!files) return;

        const newImages: File[] = Array.from(files);

        if (selectedImages.length + newImages.length > MAX_IMAGES) {
            setImageError(
                `You can only upload a maximum of ${MAX_IMAGES} images.`
            );
            return;
        }

        const imageObjects = newImages
            .filter((file) => file.type.startsWith("image/"))
            .map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));

        if (imageObjects.length !== newImages.length) {
            setImageError(
                "Some files were not valid image types and were ignored."
            );
        }

        setSelectedImages((prevImages) => [...prevImages, ...imageObjects]);
        event.target.value = "";
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedImages((prevImages) => {
            const imageToRemove = prevImages[indexToRemove];
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prevImages.filter((_, index) => index !== indexToRemove);
        });
        setImageError("");
    };

    useEffect(() => {
        // Cleanup function runs on component unmount
        return () => {
            // Use the ref to access the latest selectedImages
            selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Basic validation example (can be expanded)
        if (!title.trim()) {
            alert("Title is required.");
            return;
        }
        if (!description.trim()) {
            alert("Description is required.");
            return;
        }

        const formData = {
            title,
            version,
            tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== ""), // Split tags into an array
            description,
            images: selectedImages.map((imgPreview) => imgPreview.file), // Get the actual File objects
        };

        console.log("Mock Form Submission Data:", formData);

        // Mock API call simulation (optional)
        // await new Promise(resolve => setTimeout(resolve, 1000));

        alert(
            `Mock submission successful!\nTitle: ${formData.title}\nVersion: ${
                formData.version
            }\nTags: ${formData.tags.join(
                ", "
            )}\nDescription: ${formData.description.substring(
                0,
                30
            )}...\nImages: ${formData.images.length}`
        );

        // Here you would typically send formData to a backend API
        // For now, we can also reset parts of the form if desired
        // setTitle('');
        // setVersion('');
        // setTags('');
        // setDescription('');
        // setSelectedImages([]);
        // setImageError('');
        // setActiveTab('edit');
    };

    return (
        <>
            <NavBar />
            <main className="container mx-auto p-4 pt-20 sm:pt-24"> {/* Adjusted padding top */}
                <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
                    Upload Mod
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-card-bg p-6 shadow-md rounded-card max-w-3xl mx-auto" /* Added max-width and mx-auto */
                >
                    {/* Title Field */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-400 rounded-input p-2 bg-background text-foreground"
                            required
                        />
                    </div>

                    {/* Version Field */}
                    <div>
                        <label
                            htmlFor="version"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Version
                        </label>
                        <input
                            type="text"
                            name="version"
                            id="version"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-400 rounded-input p-2 bg-background text-foreground"
                            placeholder="e.g., 1.0.0"
                        />
                    </div>

                    {/* Tags Field */}
                    <div>
                        <label
                            htmlFor="tags"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Tags
                        </label>
                        <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-400 rounded-input p-2 bg-background text-foreground"
                            placeholder="e.g., survival, tech, magic (comma-separated)"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Comma-separated values.
                        </p>
                    </div>

                    {/* Description Section */}
                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Description <span className="text-red-500">*</span>
                        </label>
                        <div className="flex border-b border-gray-300 mb-2">
                            <button
                                type="button" // Prevent form submission
                                className={`py-2 px-4 ${
                                    activeTab === "edit"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-gray-500 hover:text-primary"
                                }`}
                                onClick={() => setActiveTab("edit")}
                            >
                                Text
                            </button>
                            <button
                                type="button" // Prevent form submission
                                className={`py-2 px-4 ${
                                    activeTab === "preview"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-gray-500 hover:text-primary"
                                }`}
                                onClick={() => setActiveTab("preview")}
                            >
                                Preview
                            </button>
                        </div>
                        {activeTab === "edit" ? (
                            <textarea
                                id="description"
                                name="description"
                                rows={10}
                                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-gray-400 rounded-input p-2 bg-background text-foreground"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter mod description using Markdown..."
                                required
                            />
                        ) : (
                            <div className="prose lg:prose-xl p-2 border border-gray-400 rounded-input min-h-[200px] bg-background text-foreground">
                                <ReactMarkdown>
                                    {description ||
                                        "*No description yet. Write something in the Text tab.*"}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Image Upload Section */}
                    <div className="mb-4">
                        <label
                            htmlFor="image-upload"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Upload Images (up to {MAX_IMAGES}, optional)
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-button file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-white 
                       hover:file:opacity-90"
                        />
                        {imageError && (
                            <p className="text-red-500 text-sm mt-1">
                                {imageError}
                            </p>
                        )}

                        {selectedImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {selectedImages.map((image, index) => (
                                    <div key={index} className="relative group w-full h-32 rounded-md border border-gray-300 overflow-hidden">
                                        <Image
                                            src={image.url}
                                            alt={`Preview ${image.file.name}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button" // Prevent form submission
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-75 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove image"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-button shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Submit Mod
                        </button>
                    </div>
                </form>
            </main> {/* Changed div to main and adjusted padding */}
        </>
    );
};

export default UploadPage;
