// Simple cache for storage status to prevent redundant API calls
type StorageStatus = {
  configured: boolean;
  endpointType: string;
  missingVariables?: string[];
  error?: string;
};

interface CacheEntry {
  data: StorageStatus;
  timestamp: number;
  promise?: Promise<StorageStatus>;
}

class StorageStatusCache {
  private cache: CacheEntry | null = null;
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds
  private pendingRequest: Promise<StorageStatus> | null = null;

  async getStorageStatus(): Promise<StorageStatus> {
    const now = Date.now();

    // Return cached data if it's still valid
    if (this.cache && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    // If there's already a pending request, return that promise
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // Make a new request
    this.pendingRequest = this.fetchStorageStatus();
    
    try {
      const data = await this.pendingRequest;
      this.cache = {
        data,
        timestamp: now
      };
      return data;
    } finally {
      this.pendingRequest = null;
    }
  }

  private async fetchStorageStatus(): Promise<StorageStatus> {
    const response = await fetch('/api/storage/status');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Method to invalidate cache (useful for refreshing data)
  invalidate(): void {
    this.cache = null;
    this.pendingRequest = null;
  }
}

export const storageStatusCache = new StorageStatusCache();
