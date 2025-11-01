import { z } from "zod";
import {
    addProductType,
    addProductTypes,
    deleteProductType,
    getProductTypes,
    updateProductType,
} from "../service/productTypesService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { userPreferenceProductTypesValidation } from "@arvo/shared";

export const productTypesRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getProductTypes(ctx.user.id);
    }),
    add: protectedProcedure
        .input(z.object({ name: z.string() })) // TODO: To update when doing frontend
        .mutation(async ({ ctx, input }) => {
            return await addProductType(ctx.user.id, input.name);
        }),
    addBulk: protectedProcedure
        .input(userPreferenceProductTypesValidation)
        .mutation(async ({ ctx, input }) => {
            return await addProductTypes(ctx.user.id, input.productTypes);
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() })) // TODO: To update when doing frontend
        .mutation(async ({ input }) => {
            await deleteProductType(input.id);
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
            }),
        ) // TODO: To update when doing frontend
        .mutation(async ({ input }) => {
            await updateProductType(input.id, input.name);
        }),
});
