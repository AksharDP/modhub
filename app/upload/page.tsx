"use client";

import React, {
    useState,
    ChangeEvent,
    FormEvent,
    useEffect,
    useRef,
    useCallback, // Import useCallback
} from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import NavBar from "../components/nav";

const MAX_IMAGES = 10;

interface ImagePreview {
    id: string;
    file: File;
    url: string;
}

// Define ImagePreviewItem component
interface ImagePreviewItemProps {
    image: ImagePreview;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: "left" | "right") => void;
}

const ImagePreviewItem = React.memo<ImagePreviewItemProps>(
    ({ image, index, isFirst, isLast, onRemove, onMove }) => {
        return (
            <div
                key={image.id}
                className="relative group w-full h-32 rounded-md border border-gray-300 overflow-hidden"
            >
                <Image
                    src={image.url}
                    alt={`Preview ${image.file.name}`}
                    fill
                    className="object-cover"
                    priority={index < 3} // Prioritize loading for first few images
                />
                {/* Remove Button */}
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-75 group-hover:opacity-100 transition-opacity z-10"
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
                {/* Reorder Buttons */}
                <div className="absolute bottom-1 left-1 right-1 flex justify-between z-10 opacity-75 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={() => onMove(index, "left")}
                        disabled={isFirst}
                        className="bg-gray-700 text-white p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move image left"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(index, "right")}
                        disabled={isLast}
                        className="bg-gray-700 text-white p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move image right"
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
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }
);
ImagePreviewItem.displayName = "ImagePreviewItem";

const UploadPage = () => {
    const [title, setTitle] = useState<string>("");
    const [version, setVersion] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const [imageError, setImageError] = useState<string>("");
    const selectedImagesRef = useRef(selectedImages);

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
                id: crypto.randomUUID(), // Assign a unique ID
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

    const removeImage = useCallback((indexToRemove: number) => {
        setSelectedImages((prevImages) => {
            const imageToRemove = prevImages[indexToRemove];
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            const updatedImages = prevImages.filter((_, index) => index !== indexToRemove);
            return updatedImages;
        });
        setImageError("");
    }, []);

    useEffect(() => {
        return () => {
            selectedImagesRef.current.forEach((image) =>
                URL.revokeObjectURL(image.url)
            );
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    const moveImage = useCallback((currentIndex: number, direction: "left" | "right") => {
        setSelectedImages((prevImages) => {
            const newImages = [...prevImages];
            const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

            if (targetIndex < 0 || targetIndex >= newImages.length) {
                return newImages;
            }

            [newImages[currentIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[currentIndex]];
            return newImages;
        });
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
                .filter((tag) => tag !== ""),
            description,
            images: selectedImages.map((imgPreview) => imgPreview.file),
        };

        console.log("Mock Form Submission Data:", formData);

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
    };

    return (
        <>
            <NavBar />
            <main className="container mx-auto p-4 pt-20 sm:pt-24">
                {" "}
                <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
                    Upload Mod
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-card-bg p-6 shadow-md rounded-card max-w-3xl mx-auto"
                >
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
                            className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-primary focus:border-primary rounded-global p-2 bg-gray-700 text-input-foreground"
                            required
                        />
                    </div>

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
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-transparent rounded-global p-2 bg-gray-700 text-input-foreground"
                            placeholder="e.g., 1.0.0"
                        />
                    </div>

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
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-transparent rounded-global p-2 bg-gray-700 text-input-foreground"
                            placeholder="e.g., survival, tech, magic (comma-separated)"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Comma-separated values.
                        </p>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Description <span className="text-red-500">*</span>
                        </label>
                        <div className="flex border-b border-gray-300 mb-2">
                            <button
                                type="button"
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
                                type="button"
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
                                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border border-transparent rounded-global p-2 bg-gray-700 text-input-foreground"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter mod description using Markdown..."
                                required
                            />
                        ) : (
                            <div className="prose lg:prose-xl p-2 border border-transparent rounded-global min-h-[200px] bg-gray-700 text-input-foreground">
                                <ReactMarkdown>
                                    {description ||
                                        "*No description yet. Write something in the Text tab.*"}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

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
                            className="block w-full text-sm text-gray-500 rounded-global
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-global file:
                       file:text-sm file:font-semibold
                       file:bg-purple-700 file:text-white
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
                                    <ImagePreviewItem
                                        key={image.id}
                                        image={image}
                                        index={index}
                                        isFirst={index === 0}
                                        isLast={index === selectedImages.length - 1}
                                        onRemove={removeImage}
                                        onMove={moveImage}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent bg-purple-700 rounded-global bg-shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Submit Mod
                        </button>
                    </div>
                </form>
            </main>{" "}
        </>
    );
};

export default UploadPage;
