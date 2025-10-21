import { addMaterialsValidation } from "shared/validation/addMaterialsValidation.js";
import { z } from "zod";
import {
    addMaterial,
    deleteMaterial,
    getMaterialsList,
    getMaterialTypes,
    type MaterialInsert,
} from "../service/materialsService.js";
import { getUnitByName } from "../service/unitsService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const materialsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialsList(ctx.user.id);
    }),
    types: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialTypes(ctx.user.id);
    }),
    add: protectedProcedure
        .input(addMaterialsValidation)
        .mutation(async ({ ctx, input }) => {
            console.log(`Unit: ${input.unit}`);
            const unit = await getUnitByName(input.unit);
            if (!unit) {
                throw new Error("Unit not found");
            }
            const inputData: MaterialInsert = {
                userId: ctx.user.id,
                unitId: unit.id,
                name: input.name,
                materialType: input.type,
                quantity: input.quantity,
                purchasePrice: input.cost,
                lastPurchaseDate: input.lastPurchaseDate,
                supplier: input.supplierName,
                notes: input.notes,
                threshold: input.minStockLevel,
                id: "",
                costPerUnit: 0,
            };
            await addMaterial(inputData);
            return { success: true };
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await deleteMaterial(input.id);
            return { success: true };
        }),
});
