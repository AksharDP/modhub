"use client";

import React, {
    useState,
    ChangeEvent,
    // FormEvent, // No longer directly used for <Form action>
    useEffect,
    useRef,
    useCallback,
} from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import NavBar from "../components/nav";
// Update import from 'react-dom' to 'react' for useActionState
import { useFormStatus } from "react-dom"; 
import { useActionState } from "react"; // Import useActionState from React
import Form from "next/form"; // Import Next.js Form
import { uploadModAction, UploadState } from "./actions"; // Import server action

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

const initialState: UploadState = {
    message: null,
    errors: {},
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent bg-purple-700 rounded-global shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
        >
            {pending ? "Submitting..." : "Submit Mod"}
        </button>
    );
}

const UploadPage = () => {
    const [title, setTitle] = useState<string>("");
    const [version, setVersion] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const [imageError, setImageError] = useState<string>("");
    const selectedImagesRef = useRef(selectedImages);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

    // Rename useFormState to useActionState
    const [state, formAction] = useActionState(uploadModAction, initialState);

    useEffect(() => {
        selectedImagesRef.current = selectedImages;
    }, [selectedImages]);

    useEffect(() => {
        if (state.success && state.message) {
            alert(state.message); // Or use a more sophisticated notification system
            // Optionally reset form fields here
            setTitle("");
            setVersion("");
            setTags("");
            setDescription("");
            setSelectedImages([]);
            setImageError("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // Reset form state if needed, though useFormState might handle this if action is re-triggered
        } else if (!state.success && state.message && !state.errors?.general) {
             // General message not tied to specific fields, but not a field validation error message
            if(Object.keys(state.errors || {}).length === 0) {
                alert(`Error: ${state.message}`);
            }
        }
    }, [state]);


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
        // Clear the input value to allow selecting the same file again or different files in subsequent actions
        if (event.target) {
            event.target.value = "";
        }
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

    // Removed old handleSubmit function

    const handleFormSubmitAttempt = () => {
        // Populate the actual file input with the files from selectedImages state.
        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            if (selectedImages.length > 0) {
                selectedImages.forEach(imgPreview => {
                    dataTransfer.items.add(imgPreview.file);
                });
                fileInputRef.current.files = dataTransfer.files;
            } else {
                // If no images are selected, ensure the FileList is truly empty.
                fileInputRef.current.files = new DataTransfer().files;
            }
        }
        // Client-side validation alerts removed. Rely on server validation feedback.
        return true; // Indicate client-side preparation is done
    };


    return (
        <>
            <NavBar />
            <main className="container mx-auto p-4 pt-20 sm:pt-24">
                {" "}
                <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
                    Upload Mod
                </h1>
                {/* Use Next.js Form component and pass the server action */}
                <Form
                    action={formAction}
                    onSubmit={() => {
                        console.log("Client: Form onSubmit triggered. Calling handleFormSubmitAttempt."); // Diagnostic log
                        // This onSubmit is for client-side tasks before server action.
                        // The actual submission to server action is handled by <Form action={...}>.
                        // We call handleFormSubmitAttempt to populate file input and do basic validation.
                        // If basic client validation fails, we can prevent form submission here,
                        // though `next/form` might not support `e.preventDefault()` in the same way.
                        // For now, `handleFormSubmitAttempt` populates files.
                        // The alerts for title/description will show, but form might still submit.
                        // Proper way with server actions is to rely on server validation primarily.
                        // The `handleFormSubmitAttempt` mainly serves to prepare the file input.
                        handleFormSubmitAttempt();
                    }}
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
                            name="title" // Add name attribute
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-primary focus:border-primary rounded-global p-2 bg-gray-700 text-input-foreground"
                            required
                        />
                        {state.errors?.title && <p className="text-red-500 text-sm mt-1">{state.errors.title.join(", ")}</p>}
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
                            name="version" // Add name attribute
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
                            name="tags" // Add name attribute
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
                                name="description" // Add name attribute
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
                        {state.errors?.description && <p className="text-red-500 text-sm mt-1">{state.errors.description.join(", ")}</p>}
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
                            name="modImages" // Add name attribute for server action
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageChange}
                            ref={fileInputRef} // Assign ref
                            className="block w-full text-sm text-gray-500 rounded-global
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-global file:border-0
                       file:text-sm file:font-semibold
                       file:bg-purple-700 file:text-white
                       hover:file:opacity-90"
                        />
                        {imageError && (
                            <p className="text-red-500 text-sm mt-1">
                                {imageError}
                            </p>
                        )}
                        {state.errors?.images && <p className="text-red-500 text-sm mt-1">{state.errors.images.join(", ")}</p>}


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
                    {state.errors?.general && <p className="text-red-500 text-sm mt-1">{state.errors.general.join(", ")}</p>}
                    {!state.success && state.message && Object.keys(state.errors || {}).length > 0 && (
                        <p className="text-red-500 text-sm mt-1">Please correct the errors above.</p>
                    )}
                     {state.success && state.message && (
                        <p className="text-green-500 text-sm mt-1">{state.message}</p>
                    )}


                    <div>
                        <SubmitButton />
                    </div>
                </Form>
            </main>{" "}
        </>
    );
};

export default UploadPage;
