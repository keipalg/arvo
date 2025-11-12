import { z } from "zod";
import {
    addMaterial,
    deleteMaterial,
    getMaterialsList,
    updateMaterial,
    getMaterialListForRecipe,
    getMostUsedMaterial,
    getMaterialsLowOnStock,
    getTotalInventoryValue,
    checkMaterialUsage,
    type MaterialInsert,
    type MaterialUpdate,
} from "../service/materialsService.js";
import { getUnitByName } from "../service/unitsService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import {
    addMaterialsValidation,
    updateMaterialsValidation,
} from "@arvo/shared";
import { TRPCError } from "@trpc/server";

export const materialsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialsList(ctx.user.id);
    }),
    add: protectedProcedure
        .input(addMaterialsValidation)
        .mutation(async ({ ctx, input }) => {
            try {
                const unit = await getUnitByName(input.unit);
                if (!unit) {
                    throw new Error("Unit not found");
                }
                const inputData: MaterialInsert = {
                    userId: ctx.user.id,
                    unitId: unit.id,
                    name: input.name,
                    materialTypeId: input.typeId,
                    quantity: input.quantity,
                    purchasePrice: input.purchasePrice,
                    lastPurchaseDate: input.lastPurchaseDate,
                    supplier: input.supplierName,
                    supplierUrl: input.supplierUrl,
                    notes: input.notes,
                    threshold: input.minStockLevel,
                    id: "",
                };
                await addMaterial(inputData);
                console.log(`Successfully added material: ${input.name}`);
                return { success: true };
            } catch (error) {
                console.error(`Failed to add material ${input.name}:`, error);
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "ADD_FAILED",
                    cause: error,
                });
            }
        }),
    update: protectedProcedure
        .input(updateMaterialsValidation)
        .mutation(async ({ ctx, input }) => {
            try {
                const unit = await getUnitByName(input.unit);
                if (!unit) {
                    throw new Error("Unit not found");
                }

                const updateData: MaterialUpdate = {
                    name: input.name,
                    materialTypeId: input.typeId,
                    quantity: input.quantity,
                    threshold: input.minStockLevel,
                    lastPurchaseDate: input.lastPurchaseDate,
                    unitId: unit.id,
                };

                // Optional fields - only set if provided
                if (input.purchasePrice !== undefined) {
                    updateData.purchasePrice = input.purchasePrice;
                }
                if (input.purchaseQuantity !== undefined) {
                    updateData.purchaseQuantity = input.purchaseQuantity;
                }
                if (input.supplierName !== undefined) {
                    updateData.supplier = input.supplierName;
                }
                if (input.supplierUrl !== undefined) {
                    updateData.supplierUrl = input.supplierUrl;
                }
                if (input.notes !== undefined) {
                    updateData.notes = input.notes;
                }

                await updateMaterial(input.id, ctx.user.id, updateData);
                console.log(`Successfully updated material: ${input.name}`);
                return { success: true };
            } catch (error) {
                console.error(
                    `Failed to update material ${input.name}:`,
                    error,
                );
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "UPDATE_FAILED",
                    cause: error,
                });
            }
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            try {
                await deleteMaterial(input.id);
                console.log(
                    `Successfully deleted material with ID: ${input.id}`,
                );
                return { success: true };
            } catch (error) {
                console.error(`Failed to delete material ${input.id}:`, error);
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "DELETE_FAILED",
                    cause: error,
                });
            }
        }),
    checkUsage: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return await checkMaterialUsage(input.id);
        }),

    materialList: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialListForRecipe(ctx.user.id);
    }),

    // Insights endpoints for Materials page
    mostUsedMaterial: protectedProcedure.query(async ({ ctx }) => {
        return await getMostUsedMaterial(ctx.user.id);
    }),
    lowStockCount: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialsLowOnStock(ctx.user.id);
    }),
    totalInventoryValue: protectedProcedure.query(async ({ ctx }) => {
        return await getTotalInventoryValue(ctx.user.id);
    }),
});
