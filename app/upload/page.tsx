"use client";

import React, {
    useState,
    ChangeEvent,
    useEffect,
    useRef,
    useCallback,
    Suspense,
} from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Form from "next/form";
import { uploadModAction, UploadState } from "./actions";
import { useSearchParams } from "next/navigation";

const MAX_IMAGES = 10;

interface ImagePreview {
    id: string;
    file: File;
    url: string;
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

// Dynamic form field renderer component
const DynamicFormField: React.FC<{
    field: FormField;
    value: string | boolean | File | null;
    onChange: (value: string | boolean | File | null) => void;
    error?: string;
}> = ({ field, value, onChange, error }) => {
    const fieldId = `custom-${field.id}`;
    
    return (
        <div className="mb-4">
            {field.type === "text" && (
                <>
                    <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        id={fieldId}
                        name={fieldId}
                        value={(value as string) || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-purple-500 focus:border-purple-500 rounded-global p-2 bg-gray-700 text-input-foreground"
                    />
                </>
            )}
            {field.type === "textarea" && (
                <>
                    <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        id={fieldId}
                        name={fieldId}
                        value={(value as string) || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-purple-500 focus:border-purple-500 rounded-global p-2 bg-gray-700 text-input-foreground"
                    />
                </>
            )}
            {field.type === "select" && (
                <>
                    <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        id={fieldId}
                        name={fieldId}
                        value={(value as string) || ""}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-purple-500 focus:border-purple-500 rounded-global p-2 bg-gray-700 text-input-foreground"
                    >
                        <option value="">Select an option...</option>
                        {field.options?.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                        ))}
                    </select>
                </>
            )}
            {field.type === "checkbox" && (
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        id={fieldId}
                        name={fieldId}
                        checked={(value as boolean) || false}
                        onChange={(e) => onChange(e.target.checked)}
                        className="rounded text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-foreground">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </span>
                </label>
            )}
            {field.type === "file" && (
                <>
                    <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="file"
                        id={fieldId}
                        name={fieldId}
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        required={field.required}
                        className="block w-full text-sm text-gray-500 rounded-global file:mr-4 file:py-2 file:px-4 file:rounded-global file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                    />
                </>
            )}
            {field.type === "static-text" && (
                <div 
                    className="py-2"
                    style={{ color: field.color || "#FFFFFF" }}
                    dangerouslySetInnerHTML={{ __html: field.content || field.label }}
                />
            )}
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

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
                    priority={index < 3}
                />
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
    const searchParams = useSearchParams();
    const gameSlug = searchParams.get('game');
    
    const [selectedGameSlug, setSelectedGameSlug] = useState<string>(gameSlug || "");
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean | File | null>>({});
    
    const [title, setTitle] = useState<string>("");
    const [version, setVersion] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const [imageError, setImageError] = useState<string>("");
    const selectedImagesRef = useRef(selectedImages);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [state, formAction] = useActionState(uploadModAction, initialState);

    const [games, setGames] = useState<{ id: number; name: string; slug: string }[]>([]);
    const [selectedGame, setSelectedGame] = useState<{ id: number; name: string; slug: string; formSchema?: FormField[] } | null>(null);

    // Fetch available games
    useEffect(() => {
        fetch("/api/games")
            .then((res) => res.json())
            .then((data) => setGames(data.games || []));
    }, []);
    
    // Fetch selected game details including form schema
    useEffect(() => {
        if (!selectedGameSlug) {
            setSelectedGame(null);
            return;
        }
        fetch(`/api/games/${selectedGameSlug}`)
            .then((res) => res.json())
            .then((data) => setSelectedGame(data));
    }, [selectedGameSlug]);

    // Handle game selection change
    const handleGameChange = (gameSlug: string) => {
        setSelectedGameSlug(gameSlug);
        setCustomFieldValues({}); // Reset custom field values when game changes
    };

    // Handle custom field value changes
    const updateCustomFieldValue = (fieldId: string, value: string | boolean | File | null) => {
        setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    useEffect(() => {
        selectedImagesRef.current = selectedImages;
    }, [selectedImages]);    useEffect(() => {
        if (state.success && state.message) {
            alert(state.message);
            setTitle("");
            setVersion("");
            setTags("");
            setDescription("");
            setSelectedImages([]);
            setImageError("");
            setCustomFieldValues({});
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else if (!state.success && state.message && !state.errors?.general) {
            if (Object.keys(state.errors || {}).length === 0) {
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
                id: crypto.randomUUID(),
                file,
                url: URL.createObjectURL(file),
            }));

        if (imageObjects.length !== newImages.length) {
            setImageError(
                "Some files were not valid image types and were ignored."
            );
        }

        setSelectedImages((prevImages) => [...prevImages, ...imageObjects]);
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
            const updatedImages = prevImages.filter(
                (_, index) => index !== indexToRemove
            );
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
    }, []);

    const moveImage = useCallback(
        (currentIndex: number, direction: "left" | "right") => {
            setSelectedImages((prevImages) => {
                const newImages = [...prevImages];
                const targetIndex =
                    direction === "left" ? currentIndex - 1 : currentIndex + 1;

                if (targetIndex < 0 || targetIndex >= newImages.length) {
                    return newImages;
                }

                [newImages[currentIndex], newImages[targetIndex]] = [
                    newImages[targetIndex],
                    newImages[currentIndex],
                ];
                return newImages;
            });
        },
        []
    );


    const handleFormSubmitAttempt = () => {
        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            if (selectedImages.length > 0) {
                selectedImages.forEach((imgPreview) => {
                    dataTransfer.items.add(imgPreview.file);
                });
                fileInputRef.current.files = dataTransfer.files;
            } else {
                fileInputRef.current.files = new DataTransfer().files;
            }
        }
        return true;
    };
    return (
        <div>
            <main className="container mx-auto p-4 pt-20 sm:pt-24">
                {" "}
                <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
                    Upload Mod
                </h1>                <Form
                    action={formAction}
                    onSubmit={() => {
                        console.log(
                            "Client: Form onSubmit triggered. Calling handleFormSubmitAttempt."
                        );
                        handleFormSubmitAttempt();
                    }}
                    className="space-y-6 bg-card-bg p-6 shadow-md rounded-card max-w-3xl mx-auto"
                >                    {/* Game Selection */}
                    <div>
                        <label
                            htmlFor="game"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Game <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="game"
                            id="game"
                            value={selectedGameSlug}
                            onChange={(e) => handleGameChange(e.target.value)}
                            className="shadow-sm block w-full sm:text-sm border border-transparent focus:ring-purple-500 focus:border-purple-500 rounded-global p-2 bg-gray-700 text-input-foreground"
                            required
                        >
                            <option value="">Select a game...</option>
                            {games?.map((game) => (
                                <option key={game.id} value={game.slug}>
                                    {game.name}
                                </option>
                            ))}
                        </select>
                        {state.errors?.game && (
                            <p className="text-red-500 text-sm mt-1">
                                {state.errors.game.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Standard Fields */}
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
                        {state.errors?.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {state.errors.title.join(", ")}
                            </p>
                        )}
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
                        {state.errors?.description && (
                            <p className="text-red-500 text-sm mt-1">
                                {state.errors.description.join(", ")}
                            </p>                        )}
                    </div>

                    {/* Dynamic Custom Fields */}
                    {selectedGame?.formSchema && Array.isArray(selectedGame.formSchema) && selectedGame.formSchema.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-foreground mb-4 border-b border-gray-600 pb-2">
                                {selectedGame.name} Specific Fields
                            </h3>
                            <div className="space-y-4">
                                {(selectedGame.formSchema as FormField[])
                                    .sort((a, b) => a.order - b.order)
                                    .map((field) => (
                                        <DynamicFormField
                                            key={field.id}
                                            field={field}
                                            value={customFieldValues[field.id] || (field.type === 'checkbox' ? false : '')}
                                            onChange={(value) => updateCustomFieldValue(field.id, value)}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label
                            htmlFor="image-upload"
                            className="block text-sm font-medium text-foreground mb-1"
                        >
                            Upload Images (up to {MAX_IMAGES}, optional)
                        </label>
                        <input
                            id="image-upload"
                            name="modImages"
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageChange}
                            ref={fileInputRef}
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
                        {state.errors?.images && (
                            <p className="text-red-500 text-sm mt-1">
                                {state.errors.images.join(", ")}
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
                                        isLast={
                                            index === selectedImages.length - 1
                                        }
                                        onRemove={removeImage}
                                        onMove={moveImage}
                                    />
                                ))}
                            </div>
                        )}
                    </div>{" "}
                    {state.errors?.general && (
                        <p className="text-red-500 text-sm mt-1">
                            {state.errors.general.join(", ")}
                        </p>
                    )}
                    {!state.success &&
                        state.message &&
                        Object.keys(state.errors || {}).length > 0 && (
                            <p className="text-red-500 text-sm mt-1">
                                Please correct the errors above.
                            </p>
                        )}
                    {state.success && state.message && (
                        <p className="text-green-500 text-sm mt-1">
                            {state.message}
                        </p>
                    )}
                    <div>
                        <SubmitButton />
                    </div>
                </Form>
            </main>
        </div>
    );
};

const Page = () => (
    <Suspense>
        <UploadPage />
    </Suspense>
);

export default Page;
