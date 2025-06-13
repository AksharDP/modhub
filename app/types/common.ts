import { FormField } from "../db/schema";

export interface ModInterface {
    modId: number;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    authorPFP: string;
    category: string | string[];
    likes: number;
    downloads: number;
    size: string;
    uploaded: Date | string | number;
    lastUpdated: Date | string | number;
    slug?: string;
    version?: string;
    downloadUrl?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    authorId?: number;
    stats?: {
        totalDownloads: number | null;
        likes: number | null;
        views?: number | null;
        rating?: number | null;
        ratingCount?: number | null;
    } | null;
    allImageUrls?: string[]; // Added
    fileVersions?: FileVersionInterface[]; // Added
    tags?: string[]; // Added
    game?: { // Added
        id: number;
        name: string;
        slug: string;
    };
    categoryId?: number; // Was present in the initial attachment, re-adding as it might be used.
}

export interface FileVersionInterface {
    id: string;
    version: string;
    fileName: string;
    fileSize: string;
    uploadDate: string | number | Date;
    downloadUrl: string;
    changelog?: string;
    isLatest: boolean;
}

export interface CardProps {
    modId: number;
    gameName: string;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    authorPFP: string;
    category: string | string[];
    likes: number;
    downloads: number;
    size: string;
    uploaded: string | number | Date;
    lastUpdated: string | number | Date;
}

export type GameWithSerializedDatesInterface = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean | null;
    visibleToUsers: boolean | null;
    visibleToSupporters: boolean | null;
    formSchema: FormField[] | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export interface ModImageData {
    title: string;
    ImageUrls: string[];
}

export interface ImageGalleryProps {
    modImages: ModImageData;
    currentImageIndex: number;
    setCurrentImageIndex: (index: number) => void;
    prevImage: () => void;
    nextImage: () => void;
}