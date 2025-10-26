import { z } from "zod";
import { db } from "./db/client.js";
import { sampleTable } from "./db/schema.js";
import type { About } from "shared/types/sample.ts";
import { salesRouter } from "./routes/salesRoute.js";
import { channelRouter } from "./routes/channelRoute.js";
import { publicProcedure, router } from "./routes/trpcBase.js";
import { materialsRouter } from "./routes/materialsRoute.js";
import { operationalExpenseRouter } from "./routes/operationalExpenseRoutes.js";
import { goodsRouter } from "./routes/goodsRoute.js";
import { statusRouter } from "./routes/statusRoute.js";
import { unitsRouter } from "./routes/units.js";
import { studioOverheadExpenseRouter } from "./routes/studioOverheadExpenseRoutes.js";
import { materialTypesRouter } from "./routes/materialTypesRoute.js";
import { userPreferencesRouter } from "./routes/userPreferencesRoute.js";
import { productionBatchRouter } from "./routes/productionBatchRoute.js";

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
    materialTypes: materialTypesRouter,
    units: unitsRouter,
    operationalExpense: operationalExpenseRouter,
    studioOverheadExpense: studioOverheadExpenseRouter,
    goods: goodsRouter,
    channel: channelRouter,
    status: statusRouter,
    userPreferences: userPreferencesRouter,
    productionBatch: productionBatchRouter,
});

export type AppRouter = typeof appRouter;
