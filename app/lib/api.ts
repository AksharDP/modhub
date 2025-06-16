// Utility function to handle API requests with auth error handling
export async function apiRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        credentials: "include",
        ...options,
    });

    // Check for authentication errors
    if (response.status === 401) {
        // Handle auth error globally via window
        if (typeof window !== 'undefined') {
            const globalWindow = window as typeof window & { 
                handleAuthError?: (error: { status: number }) => void 
            };
            if (globalWindow.handleAuthError) {
                globalWindow.handleAuthError({ status: 401 });
            }
        }
        throw new Error('Unauthorized');
    }

    return response;
}

// Hook to use API requests with auth handling
export function useApiRequest() {
    return apiRequest;
}
