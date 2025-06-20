"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Form from "next/form";
import Image from "next/image";
import { createModAction, CreateModState } from "./create-mod-action";
import { PresignedUploader } from "../lib/presigned-uploader";
import UploadProgressDisplay from "../components/UploadProgressDisplay";
import { useRouter } from "next/navigation";

const MAX_IMAGES = 10;

interface ImagePreview {
    id: string;
    file: File;
    url: string;
}

interface UploadProgress {
    fileIndex: number;
    fileName: string;
    progress: number;
    completed: boolean;
    error?: string;
}

// FormField interface to match the FormBuilder
interface FormField {
    id: string;
    type: "text" | "textarea" | "select" | "checkbox" | "file" | "static-text";
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    content?: string;
    color?: string;
    order: number;
}

const initialState: CreateModState = {
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
            className="w-full flex justify-center py-3 px-4 border border-transparent bg-purple-700 rounded-[var(--border-radius-button)] shadow-sm text-sm font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
        >
            {pending ? "Creating Mod..." : "Create Mod & Upload Files"}
        </button>
    );
}

export default function NewUploadPage() {
    const router = useRouter();    // Form state
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const [modFile, setModFile] = useState<File | null>(null);
    const [games, setGames] = useState<{ id: number; name: string; slug: string; formSchema?: FormField[] }[]>([]);
    const [imageError, setImageError] = useState<string>("");
    
    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dragOverItem, setDragOverItem] = useState<string | null>(null);
    
    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [state, formAction] = useActionState(createModAction, initialState);

    // Fetch available games
    useEffect(() => {
        if (games.length > 0) return;
        
        fetch("/api/games?forUpload=true")
            .then((res) => res.json())
            .then((data) => {
                const allGames = data.games || [];
                setGames(allGames);
            })
            .catch((error) => {
                console.error("Failed to fetch games:", error);
            });     
    }, [games.length]);

    const handleFileUploads = useCallback(async (modId: number, gameSlug: string) => {
        const filesToUpload = [...selectedImages.map(img => img.file)];
        if (modFile) {
            filesToUpload.push(modFile);
        }

        if (filesToUpload.length === 0) {
            // No files to upload, redirect to mod page
            router.push(`/mod/${modId}`);
            return;
        }

        setIsUploading(true);
        
        try {
            const uploader = new PresignedUploader(
                gameSlug,
                modId,
                (progress, overall) => {
                    setUploadProgress(progress);
                    setOverallProgress(overall);
                }
            );

            // Upload images first
            if (selectedImages.length > 0) {
                await uploader.uploadFiles(selectedImages.map(img => img.file), 'image');
            }

            // Upload mod file
            if (modFile) {
                await uploader.uploadFiles([modFile], 'mod');
            }

            setUploadComplete(true);
            
            // Redirect to the mod page after a short delay
            setTimeout(() => {
                router.push(`/mod/${modId}`);
            }, 2000);

        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsUploading(false);
        }
    }, [selectedImages, modFile, router]);

    // Handle mod creation success
    useEffect(() => {
        if (state.success && state.modId && state.gameSlug && !isUploading && !uploadComplete) {
            handleFileUploads(state.modId, state.gameSlug);
        }
    }, [state, isUploading, uploadComplete, handleFileUploads]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImageError("");
        const files = event.target.files;
        if (!files) return;

        const newImages: File[] = Array.from(files);

        if (selectedImages.length + newImages.length > MAX_IMAGES) {
            setImageError(`You can only upload a maximum of ${MAX_IMAGES} images.`);
            return;
        }

        const imageObjects = newImages
            .filter((file) => file.type.startsWith("image/"))
            .map((file) => ({
                id: crypto.randomUUID(),
                file,
                url: URL.createObjectURL(file),
            }));

        if (imageObjects.length !== newImages.length) {
            setImageError("Some files were not valid image types and were ignored.");
        }

        setSelectedImages((prevImages) => [...prevImages, ...imageObjects]);
        if (event.target) {
            event.target.value = "";
        }
    };

    const handleModFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setModFile(file);
        }
    };

    const removeImage = (imageId: string) => {
        setSelectedImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prev.filter(img => img.id !== imageId);
        });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, imageId: string) => {
        setDraggedItem(imageId);
    };

    const handleDragEnter = (imageId: string) => {
        setDragOverItem(imageId);
        if (draggedItem && draggedItem !== imageId) {
            setSelectedImages(currentImages => {
                const draggedIndex = currentImages.findIndex(img => img.id === draggedItem);
                const dragOverIndex = currentImages.findIndex(img => img.id === imageId);

                if (draggedIndex === -1 || dragOverIndex === -1) return currentImages;

                const newImages = [...currentImages];
                const [removed] = newImages.splice(draggedIndex, 1);
                newImages.splice(dragOverIndex, 0, removed);
                return newImages;
            });
        }
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    if (uploadComplete) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
                    <p className="text-gray-400">Redirecting to your mod page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-center">Upload Your Mod</h1>
                
                {isUploading && (
                    <div className="mb-8">
                        <UploadProgressDisplay 
                            uploadProgress={uploadProgress}
                            overallProgress={overallProgress}
                            isUploading={isUploading}
                        />
                    </div>
                )}

                {!isUploading && (
                    <Form action={formAction} className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Mod Title *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                                        placeholder="Enter your mod title"
                                    />
                                    {state.errors?.title && (<div className="text-red-400 text-sm mt-1">{state.errors.title.join(', ')}</div>)}
                                </div>
                                <div>
                                    <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                                    <input
                                        type="text"
                                        id="version"
                                        name="version"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                                        placeholder="1.0.0"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-2">Game *</label>
                                <select id="game" name="game" required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none">
                                    <option value="">Select a game...</option>
                                    {games.map((game) => (<option key={game.id} value={game.slug}>{game.name}</option>))}
                                </select>
                                {state.errors?.game && (<div className="text-red-400 text-sm mt-1">{state.errors.game.join(', ')}</div>)}
                            </div>
                            <div className="mt-6">
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="gameplay, graphics, ui (comma separated)"
                                />
                            </div>
                            <div className="mt-6">
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" name="isAdult" className="rounded text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500"/>
                                    <span className="text-gray-300">This mod contains adult content</span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <textarea id="description" name="description" required rows={8} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none resize-none" placeholder="Describe your mod..."/>
                            {state.errors?.description && (<div className="text-red-400 text-sm mt-1">{state.errors.description.join(', ')}</div>)}
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4">Files</h2>
                            <div className="mb-6">
                                <label htmlFor="modFile" className="block text-sm font-medium text-gray-300 mb-2">Mod File *</label>
                                <input type="file" id="modFile" onChange={handleModFileChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer"/>
                                {modFile && (<div className="mt-2 text-sm text-gray-400">Selected: {modFile.name} ({(modFile.size / 1024 / 1024).toFixed(2)} MB)</div>)}
                            </div>
                            <div>
                                <label htmlFor="images" className="block text-sm font-medium text-gray-300 mb-2">
                                    Screenshots (Optional, max {MAX_IMAGES})
                                    {selectedImages.length > 0 && (<span className="text-gray-400 text-xs ml-2">(First image is thumbnail. Drag to reorder.)</span>)}
                                </label>
                                <input type="file" id="images" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer"/>
                                {imageError && (<div className="text-red-400 text-sm mt-2">{imageError}</div>)}
                                {selectedImages.length > 0 && (
                                    <div className="mt-4">
                                        <div
                                            className="flex flex-wrap gap-4 p-2 rounded-lg bg-gray-700/50 border border-gray-600"
                                            onDragOver={handleDragOver}
                                        >
                                            {selectedImages.map((image, index) => {
                                                const isFirstImage = index === 0;
                                                const isDragging = draggedItem === image.id;
                                                const isDragOver = dragOverItem === image.id;

                                                return (
                                                    <div
                                                        key={image.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, image.id)}
                                                        onDragEnter={() => handleDragEnter(image.id)}
                                                        onDragEnd={handleDragEnd}
                                                        className={`w-32 h-32 relative group rounded-lg ${
                                                            isFirstImage ? 'ring-2 ring-yellow-400 shadow-lg' : 'ring-1 ring-gray-500'
                                                        } ${isDragging ? 'shadow-2xl opacity-50' : 'shadow-md'} ${isDragOver ? 'ring-2 ring-blue-500' : ''}`}
                                                        style={{
                                                            cursor: 'grab',
                                                        }}
                                                    >
                                                        <Image src={image.url} alt="Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                                                        {isFirstImage && (<div className="absolute bottom-1 left-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-semibold shadow-md">THUMBNAIL</div>)}
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(image.id); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                            ×
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-full max-w-md">
                                <SubmitButton />
                            </div>
                        </div>
                        {state.message && !state.success && (
                            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                                {state.message}
                            </div>
                        )}
                    </Form>
                )}
            </div>
        </div>
    );
}
