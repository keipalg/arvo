import { z } from "zod";
import { productionBatchInputValidation } from "@arvo/shared";
import {
    deleteProductionBatch,
    getProductionBatch,
    getProductionStatusList,
    processProductionBatch,
} from "../service/productionBatchService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const productionBatchRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getProductionBatch(ctx.user.id);
    }),

    productionStatus: protectedProcedure.query(async () => {
        return await getProductionStatusList();
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

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await deleteProductionBatch(input.id, ctx.user.id);
            return { success: true };
        }),
});
