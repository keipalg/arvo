import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { AppRouter as appRouter } from "../../../backend/src/trpc.js";
export type { AppRouter } from "../../../backend/src/trpc.js";

import superjson from "superjson";

export const queryClient = new QueryClient();

export const trpcClient = createTRPCClient<appRouter>({
    links: [
        httpBatchLink({
            url: import.meta.env.VITE_BASE_URL
                ? `${import.meta.env.VITE_BASE_URL}/trpc`
                : "http://localhost:8080/trpc",
            transformer: superjson,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            },
        }),
    ],
});

export const trpc = createTRPCOptionsProxy<appRouter>({
    client: trpcClient,
    queryClient,
});
