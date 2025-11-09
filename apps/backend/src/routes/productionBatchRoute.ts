import {
    productionBatchInputValidation,
    productionBatchUpdateValidation,
    batchTimezoneValidation,
} from "@arvo/shared";

import { z } from "zod";
import {
    deleteProductionBatch,
    getMostProducedProductWithComparison,
    getLeastProducedProductWithComparison,
    getProductionBatch,
    processProductionBatch,
    processProductionBatchUpdate,
} from "../service/productionBatchService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const productionBatchRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getProductionBatch(ctx.user.id);
    }),

    add: protectedProcedure
        .input(productionBatchInputValidation)
        .mutation(async ({ ctx, input }) => {
            try {
                return await processProductionBatch(input, ctx.user.id);
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(
                        `Production batch creation failed: ${error.message}`,
                    );
                }
                throw new Error("Production batch creation failed");
            }
        }),

    update: protectedProcedure
        .input(productionBatchUpdateValidation)
        .mutation(async ({ ctx, input }) => {
            try {
                return await processProductionBatchUpdate(ctx.user.id, input);
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(
                        `Production batch update failed: ${error.message}`,
                    );
                }
                throw new Error("Production batch update failed");
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await deleteProductionBatch(input.id, ctx.user.id);
            return { success: true };
        }),
    mostProducedProductWithComparison: protectedProcedure
        .input(batchTimezoneValidation)
        .query(async ({ ctx, input }) => {
            return await getMostProducedProductWithComparison(
                ctx.user.id,
                input.timezone,
            );
        }),

    leastProducedProductWithComparison: protectedProcedure
        .input(batchTimezoneValidation)
        .query(async ({ ctx, input }) => {
            return await getLeastProducedProductWithComparison(
                ctx.user.id,
                input.timezone,
            );
        }),
});
