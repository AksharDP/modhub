import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseFetchOptions<T = unknown> {
  skip?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook that prevents duplicate API requests and provides request cancellation
 * Also handles React StrictMode double-execution in development
 */
export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | null>(null);

  // useRef to keep track of the fetch controller to abort on unmount or new request
  const abortControllerRef = useRef<AbortController | null>(null);

  const { skip = false, onSuccess, onError } = options;

  const fetchData = useCallback(async (fetchUrl: string) => {
    // If there's an ongoing fetch, cancel it.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for the new fetch.
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!controller.signal.aborted) {
        setData(result);
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Fetch was aborted, do nothing.
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (!controller.signal.aborted) {
        setError(errorMessage);
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    } finally {
      // Only set loading to false if this fetch wasn't aborted
      if (!controller.signal.aborted) {
          setLoading(false);
      }
    }
  }, [onSuccess, onError]);

  const refetch = useCallback(() => {
    if (url) {
      fetchData(url);
    }
  }, [url, fetchData]);

  useEffect(() => {
    if (skip || !url) {
      setLoading(false);
      return;
    }

    fetchData(url);

    // Cleanup function to abort fetch on component unmount or URL change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, skip, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}


/**
 * Specialized hook for paginated API requests
 */
export function usePaginatedFetch<T>(
  baseUrl: string,
  page: number,
  limit: number = 12,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const url = `${baseUrl}?page=${page}&limit=${limit}`;
  return useFetch<T>(url, options);
}