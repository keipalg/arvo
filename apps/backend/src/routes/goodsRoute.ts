import { goodsInputValidation } from "@arvo/shared";
import { z } from "zod";
import {
    addGood,
    addGoodToMaterialOutputRatio,
    addMaterialOutputRatio,
    deleteGood,
    getGoodsList,
    getMaterialsList,
    getProductTypesList,
    getUserPreference,
    getMaterialOutputRatio,
    type GoodInsert,
    type GoodToMaterialOutputRatioInsert,
    type MaterialOutputRatioInsert,
} from "../service/goodsService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const goodsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getGoodsList(ctx.user.id);
    }),

    // TODO: This is used by product page. I will replace it to use getMaterialListForRecipe
    materials: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialsList(ctx.user.id);
    }),

    productTypes: protectedProcedure.query(async ({ ctx }) => {
        return await getProductTypesList(ctx.user.id);
    }),

    userPreference: protectedProcedure.query(async ({ ctx }) => {
        return await getUserPreference(ctx.user.id);
    }),

    materialOutputRatio: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialOutputRatio(ctx.user.id);
    }),

    add: protectedProcedure
        .input(goodsInputValidation)
        .mutation(async ({ ctx, input }) => {
            const inputData: GoodInsert = {
                id: "",
                userId: ctx.user.id,
                name: input.name,
                productTypeId: input.productTypeId,
                retailPrice: input.retailPrice,
                note: input.note,
                inventoryQuantity: input.inventoryQuantity,
                minimumStockLevel: input.minimumStockLevel,
                materialCost: input.materialCost,
                laborCost: input.laborCost,
                overheadCost: input.overheadCost,
                operatingCost: input.operatingCost,
                netProfit: input.netProfit,
            };
            const goodData = await addGood(inputData);

            for (const material of input.materials) {
                const inputMaterialOutputRatio: MaterialOutputRatioInsert = {
                    id: "",
                    materialId: material.materialId,
                    input: material.amount,
                };

                const materialOutputRatioData = await addMaterialOutputRatio(
                    inputMaterialOutputRatio,
                );

                const goodToMaterialOutputRatioInput: GoodToMaterialOutputRatioInsert =
                    {
                        goodId: goodData[0].id,
                        materialOutputRatioId: materialOutputRatioData[0].id,
                    };

                await addGoodToMaterialOutputRatio(
                    goodToMaterialOutputRatioInput,
                );
            }

            return { success: true };
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await deleteGood(input.id);
            return { success: true };
        }),
});
