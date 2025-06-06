import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/routers";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: "/api/trpc",
            headers() {
                return {
                    "Accept-Encoding": "gzip, deflate, br",
                    "Cache-Control":
                        "public, max-age=60, stale-while-revalidate=300",
                };
            },
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    keepalive: true,
                } as RequestInit);
            },
        }),
    ],
});

export type { AppRouter };
