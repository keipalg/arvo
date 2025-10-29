import { z } from "zod";
import {
    addMaterial,
    deleteMaterial,
    getMaterialsList,
    updateMaterial,
    getMaterialListForRecipe,
    type MaterialInsert,
    type MaterialUpdate,
} from "../service/materialsService.js";
import { getUnitByName } from "../service/unitsService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import {
    addMaterialsValidation,
    updateMaterialsValidation,
} from "@arvo/shared";

export const materialsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialsList(ctx.user.id);
    }),
    add: protectedProcedure
        .input(addMaterialsValidation)
        .mutation(async ({ ctx, input }) => {
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
                lastPurchaseDate: input.lastPurchaseDate,
                supplier: input.supplierName,
                notes: input.notes,
                threshold: input.minStockLevel,
                id: "",
                costPerUnit: input.costPerUnit,
            };
            await addMaterial(inputData);
            return { success: true };
        }),
    update: protectedProcedure
        .input(updateMaterialsValidation)
        .mutation(async ({ ctx, input }) => {
            const unit = await getUnitByName(input.unit);
            if (!unit) {
                throw new Error("Unit not found");
            }

            const updateData: MaterialUpdate = {
                name: input.name,
                materialTypeId: input.typeId,
                quantity: input.quantity,
                costPerUnit: input.costPerUnit,
                threshold: input.minStockLevel,
                lastPurchaseDate: input.lastPurchaseDate,
                unitId: unit.id,
            };

            // Optional fields - only set if provided
            if (input.supplierName !== undefined) {
                updateData.supplier = input.supplierName;
            }
            if (input.notes !== undefined) {
                updateData.notes = input.notes;
            }

            await updateMaterial(input.id, ctx.user.id, updateData);
            return { success: true };
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await deleteMaterial(input.id);
            return { success: true };
        }),

    materialList: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialListForRecipe(ctx.user.id);
    }),
});
