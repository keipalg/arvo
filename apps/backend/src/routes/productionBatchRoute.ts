import { z } from "zod";
import { router, protectedProcedure } from "./trpcBase.js";
import {
    addProductionBatch,
    getProductionBatch,
    type BatchRecipeInsert,
    type ProductionBatchInsert,
    type ProductionBatchToBatchRecipeInsert,
    addProductionBatchToBatchRecipe,
    addBatchRecipe,
    getProductionStatusList,
    getProductionStatusByKey,
} from "../service/productionBatchService.js";
import { productionBatchInputValidation } from "shared/validation/productionBatchInputValidation.js";

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
            const statusInfo = await getProductionStatusByKey(input.statusKey);

            const inputData: ProductionBatchInsert = {
                id: "",
                goodId: input.goodId,
                productionDate: input.productionDate
                    ? new Date(input.productionDate)
                    : new Date(),
                quantity: input.quantity,
                productionCost: input.productionCost,
                statusId: statusInfo?.id,
            };

            const productionBatchData = await addProductionBatch(inputData);

            for (const material of input.materials) {
                const batchRecipeInput: BatchRecipeInsert = {
                    id: "",
                    materialId: material.materialId,
                    usageAmount: material.amount,
                };

                const batchRecipeData = await addBatchRecipe(batchRecipeInput);

                const productionBatchToRecipeInput: ProductionBatchToBatchRecipeInsert =
                    {
                        productionBatchId: productionBatchData[0].id,
                        batchRecipeId: batchRecipeData[0].id,
                    };

                await addProductionBatchToBatchRecipe(
                    productionBatchToRecipeInput,
                );
            }

            return { success: true };
        }),
});
