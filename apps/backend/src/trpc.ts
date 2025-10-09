import { z } from "zod";
import { db } from "./db/client.js";
import { sampleTable } from "./db/schema.js";
import type { About } from "shared/types/sample.ts";
import { salesRouter } from "./routes/salesRoutes.js";
import { publicProcedure, router } from "./routes/trpcBase.js";

export const appRouter = router({
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? "World"}!`;
    }),
    about: publicProcedure.query(async () => {
        const samples = await db.select().from(sampleTable);
        return samples as About[];
    }),
    sales: salesRouter,
});

export type AppRouter = typeof appRouter;
