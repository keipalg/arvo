import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "shared/trpc";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: "http://localhost:8080/trpc",
            transformer: superjson,
        }),
    ],
});
