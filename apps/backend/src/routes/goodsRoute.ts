import { z } from "zod";
import { router, protectedProcedure } from "./trpcBase.js";
import {
    getGoodsList,
    addGood,
    deleteGood,
    type GoodInsert,
} from "../service/goodsService.js";
import { goodsInputValidation } from "shared/validation/goodsValidation.js";

export const goodsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getGoodsList(ctx.user.id);
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
                // TODO: Need to add Minimum Stock quantity
            };
            const goodData = await addGood(inputData);
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await deleteGood(input.id);
            return { success: true };
        }),
});
