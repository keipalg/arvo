import { z } from "zod";
import { db } from "./db/client.js";
import { sampleTable } from "./db/schema.js";
import type { About } from "shared/types/sample.ts";
import { salesRouter } from "./routes/salesRoute.js";
import { channelRouter } from "./routes/channelRoute.js";
import { publicProcedure, router } from "./routes/trpcBase.js";
import { materialsRouter } from "./routes/materialsRoute.js";
import { operationalExpenseRouter } from "./routes/operationalExpenseRoutes.js";
import { studioOverheadExpenseRouter } from "./routes/studioOverheadRoutes.js";
import { goodsRouter } from "./routes/goodsRoute.js";
import { statusRouter } from "./routes/statusRoute.js";

export const appRouter = router({
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? "World"}!`;
    }),
    about: publicProcedure.query(async () => {
        const samples = await db.select().from(sampleTable);
        return samples as About[];
    }),
    sales: salesRouter,
    materials: materialsRouter,
    operationalExpense: operationalExpenseRouter,
    studioOverheadExpense: studioOverheadExpenseRouter,
    goods: goodsRouter,
    channel: channelRouter,
    status: statusRouter,
});

export type AppRouter = typeof appRouter;
