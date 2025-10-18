import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { AppRouter } from "shared/trpc";
import superjson from "superjson";

export const queryClient = new QueryClient();

export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "http://localhost:8080/trpc",
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

export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
});
