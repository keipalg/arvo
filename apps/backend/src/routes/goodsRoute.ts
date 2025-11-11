import { goodsInputValidation, goodsUpdateValidation } from "@arvo/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    addGood,
    addGoodToMaterialOutputRatio,
    addMaterialOutputRatio,
    deleteGood,
    deleteMaterialOutputRatio,
    getGoodsList,
    getMaterialOutputRatio,
    getMaterialOutputRatioByGoodId,
    getMaterialsList,
    getProductTypesList,
    getUserPreference,
    type GoodInsert,
    type GoodToMaterialOutputRatioInsert,
    type GoodUpdate,
    type MaterialOutputRatioInsert,
    updateGood,
    updateMaterialOutputRatio,
} from "../service/goodsService.js";
import { getSalesCount } from "../service/salesService.js";
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
                image: input.image,
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

    update: protectedProcedure
        .input(goodsUpdateValidation)
        .mutation(async ({ ctx, input }) => {
            const inputData: GoodUpdate = {
                id: input.id,
                userId: ctx.user.id,
                name: input.name,
                productTypeId: input.productTypeId,
                retailPrice: input.retailPrice,
                image: input.image,
                note: input.note,
                inventoryQuantity: input.inventoryQuantity,
                minimumStockLevel: input.minimumStockLevel,
                materialCost: input.materialCost,
                laborCost: input.laborCost,
                overheadCost: input.overheadCost,
                operatingCost: input.operatingCost,
                netProfit: input.netProfit,
            };

            await updateGood(input.id, ctx.user.id, inputData);

            const materialOutputRatioData =
                await getMaterialOutputRatioByGoodId(ctx.user.id, input.id);

            const existingMaterials = new Map(
                materialOutputRatioData.map((mor) => [mor.materialId, mor]),
            );

            const processedMaterialIds = new Set();

            for (const material of input.materials) {
                processedMaterialIds.add(material.materialId);

                const existingMaterial = existingMaterials.get(
                    material.materialId,
                );

                if (existingMaterial) {
                    // Update existing material
                    await updateMaterialOutputRatio(
                        existingMaterial.materialOutputRatioId,
                        { input: material.amount },
                    );
                } else {
                    // Add new material
                    const inputMaterialOutputRatio: MaterialOutputRatioInsert =
                        {
                            id: "",
                            materialId: material.materialId,
                            input: material.amount,
                        };

                    const materialOutputRatioData =
                        await addMaterialOutputRatio(inputMaterialOutputRatio);

                    const goodToMaterialOutputRatioInput: GoodToMaterialOutputRatioInsert =
                        {
                            goodId: input.id,
                            materialOutputRatioId:
                                materialOutputRatioData[0].id,
                        };

                    await addGoodToMaterialOutputRatio(
                        goodToMaterialOutputRatioInput,
                    );
                }
            }

            // Delete materials removed from input
            for (const [materialId, existingMaterial] of existingMaterials) {
                if (!processedMaterialIds.has(materialId)) {
                    await deleteMaterialOutputRatio(
                        existingMaterial.materialOutputRatioId,
                    );
                }
            }

            return { success: true };
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const salesCount = await getSalesCount(input.id, ctx.user.id);
            if (salesCount > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        "Cannot delete this product because it is used in sales records.",
                });
            }
            await deleteGood(input.id);
            return { success: true };
        }),

    checkInSales: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const salesCount = await getSalesCount(input.id, ctx.user.id);
            return salesCount > 0;
        }),
});
