// Global cache for user collections to prevent duplicate API calls
interface Collection {
    id: number;
    name: string;
    description: string | null;
    isPublic: boolean;
    isAdult?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface CollectionCache {
    data: Collection[] | null;
    loading: boolean;
    promise: Promise<Collection[]> | null;
}

let collectionsCache: CollectionCache = {
    data: null,
    loading: false,
    promise: null,
};

export const fetchUserCollections = async (): Promise<Collection[]> => {
    // If we already have data, return it
    if (collectionsCache.data) {
        return collectionsCache.data;
    }

    // If a request is already in progress, wait for it
    if (collectionsCache.promise) {
        return collectionsCache.promise;
    }

    // Start a new request
    collectionsCache.loading = true;
    collectionsCache.promise = (async () => {
        try {
            const response = await fetch("/api/user/collections");
            if (!response.ok) {
                throw new Error('Failed to fetch collections');
            }
            const data = await response.json();
            collectionsCache.data = data.collections;
            return data.collections;
        } catch (error) {
            console.error("Failed to fetch collections:", error);
            throw error;
        } finally {
            collectionsCache.loading = false;
            collectionsCache.promise = null;
        }
    })();

    return collectionsCache.promise;
};

export const clearCollectionsCache = () => {
    collectionsCache = {
        data: null,
        loading: false,
        promise: null,
    };
};

export const updateCollectionsCache = (collections: Collection[]) => {
    collectionsCache.data = collections;
};
