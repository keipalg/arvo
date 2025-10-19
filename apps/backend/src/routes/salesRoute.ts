import { z } from "zod";
import { router, protectedProcedure } from "./trpcBase.js";
import {
    addSale,
    addSaleDetail,
    deleteSale,
    getMaxSalesNumber,
    getProductsList,
    getSalesList,
    type SaleDetailInsert,
    type SaleInsert,
} from "../service/salesService.js";
import { getStatusByKey } from "../service/statusService.js";
import { salesInputValidation } from "shared/validation/salesValidation.js";

export const salesRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getSalesList(ctx.user.id);
    }),
    products: protectedProcedure.query(async ({ ctx }) => {
        return await getProductsList(ctx.user.id);
    }),
    add: protectedProcedure
        .input(salesInputValidation)
        .mutation(async ({ ctx, input }) => {
            const statusInfo = await getStatusByKey(input.statusKey);
            const inputData: SaleInsert = {
                id: "",
                userId: ctx.user.id,
                customer: input.customer,
                salesNumber: input.salesNumber ?? 1,
                channelId: input.channelId,
                date: input.date ? new Date(input.date) : new Date(),
                statusId: statusInfo!.id,
                totalPrice: input.totalPrice ?? "100.00",
                note: input.note,
                discount: input.discount,
                shippingFee: input.shippingFee,
                taxPercentage: input.taxPercentage,
            };
            const saledata = await addSale(inputData);

            input.products.forEach(async (product) => {
                const inputSaleDetail: SaleDetailInsert = {
                    id: "",
                    saleId: saledata[0].id,
                    goodId: product.productId,
                    quantity: product.quantity,
                    pricePerItem: product.retailPrice,
                };
                await addSaleDetail(inputSaleDetail);
            });
            return { success: true };
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await deleteSale(input.id);
            return { success: true };
        }),
    nextSalesNumber: protectedProcedure.query(async ({ ctx }) => {
        const maxNumber = await getMaxSalesNumber(ctx.user.id);
        return maxNumber + 1;
    }),
});
