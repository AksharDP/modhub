import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Add headers for compression and caching
      headers() {
        return {
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        };
      },
      // Enable fetch with compression and caching
      fetch(url, options) {
        return fetch(url, {
          ...options,
          // Enable keepalive for better connection reuse
          keepalive: true,
        } as RequestInit);
      },
    }),
  ],
});

// Export types for convenience
export type { AppRouter };
