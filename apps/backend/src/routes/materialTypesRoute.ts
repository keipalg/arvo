import { z } from "zod";
import {
    addMaterialType,
    addMaterialTypes,
    deleteMaterialType,
    getMaterialTypes,
    updateMaterialType,
} from "../service/materialTypesService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { userPreferenceMaterialTypesValidation } from "@arvo/shared";

export const materialTypesRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialTypes(ctx.user.id);
    }),
    add: protectedProcedure
        .input(z.object({ name: z.string() })) // TODO: To update when doing frontend
        .mutation(async ({ ctx, input }) => {
            return await addMaterialType(ctx.user.id, input.name);
        }),
    addBulk: protectedProcedure
        .input(userPreferenceMaterialTypesValidation)
        .mutation(async ({ ctx, input }) => {
            return await addMaterialTypes(ctx.user.id, input.materialTypes);
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() })) // TODO: To update when doing frontend
        .mutation(async ({ input }) => {
            await deleteMaterialType(input.id);
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
            }),
        ) // TODO: To update when doing frontend
        .mutation(async ({ input }) => {
            await updateMaterialType(input.id, input.name);
        }),
});
