import type { About } from "@arvo/shared";
import { z } from "zod";
import { db } from "./db/client.js";
import { sampleTable } from "./db/schema.js";
import { channelRouter } from "./routes/channelRoute.js";
import { dashboardRouter } from "./routes/dashboardRoute.js";
import { fileRouter } from "./routes/fileRouter.js";
import { goodsRouter } from "./routes/goodsRoute.js";
import { materialsRouter } from "./routes/materialsRoute.js";
import { materialTypesRouter } from "./routes/materialTypesRoute.js";
import { notificationRouter } from "./routes/notificationsRoute.js";
import { operationalExpenseRouter } from "./routes/operationalExpenseRoutes.js";
import { priceSuggestionRouter } from "./routes/priceSuggestionRoute.js";
import { productionBatchRouter } from "./routes/productionBatchRoute.js";
import { productTypesRouter } from "./routes/productTypesRoute.js";
import { salesRouter } from "./routes/salesRoute.js";
import { statusRouter } from "./routes/statusRoute.js";
import { studioOverheadExpenseRouter } from "./routes/studioOverheadExpenseRoutes.js";
import { publicProcedure, router } from "./routes/trpcBase.js";
import { unitsRouter } from "./routes/units.js";
import { userPreferencesRouter } from "./routes/userPreferencesRoute.js";
import { userRouter } from "./routes/userRouter.js";

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
    productTypes: productTypesRouter,
    units: unitsRouter,
    operationalExpense: operationalExpenseRouter,
    studioOverheadExpense: studioOverheadExpenseRouter,
    goods: goodsRouter,
    channel: channelRouter,
    status: statusRouter,
    userPreferences: userPreferencesRouter,
    productionBatch: productionBatchRouter,
    user: userRouter,
    dashboard: dashboardRouter,
    priceSuggestion: priceSuggestionRouter,
    notification: notificationRouter,
    file: fileRouter,
});

export type AppRouter = typeof appRouter;
