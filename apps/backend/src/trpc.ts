import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { db } from "./db/client.js";
import { sampleTable } from "./db/schema.js";
import type { About } from "shared/types/sample.ts";

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

export const appRouter = router({
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? "World"}!`;
    }),
    about: publicProcedure.query(async () => {
        const samples = await db.select().from(sampleTable);
        return samples as About[];
    }),
});

export type AppRouter = typeof appRouter;
