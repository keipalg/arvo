import { z } from "zod";
import { router, protectedProcedure } from "./trpcBase.js";
import {
    addSale,
    addSaleDetail,
    updateInventoryQuantity as increaseDecreaseInventoryQuantity,
    deleteSale,
    getMaxSalesNumber,
    getSalesList,
    type SaleDetailInsert,
    type SaleInsert,
    getSaleDetailsBySaleId,
    deleteSaleDetailsBySaleId,
    updateSale,
    getMonthlySalesRevenue,
    getMonthlySalesCount,
} from "../service/salesService.js";
import { getStatusByKey } from "../service/statusService.js";
import {
    salesInputValidation,
    salesMetricValidation,
    salesUpdateValidation,
} from "@arvo/shared";
import {
    getGoodInfoByIds,
    getProductsListForSales,
} from "../service/goodsService.js";
import { isProductsError, isTotalPriceError } from "../utils/salesUtil.js";
import { TRPCError } from "@trpc/server";
import { db } from "../db/client.js";
import { getUsedMaterialPerSales } from "../service/getUsedMaterialPerSales.js";

export const salesRouter = router({
    /**
     * Get list of sales.
     */
    list: protectedProcedure.query(async ({ ctx }) => {
        const salesList = await getSalesList(ctx.user.id);

        type SaleWithProducts = (typeof salesList)[number] & {
            products: Awaited<ReturnType<typeof getSaleDetailsBySaleId>>;
        };

        for (const sale of salesList) {
            const saleDetails = await getSaleDetailsBySaleId(sale.id);
            (sale as SaleWithProducts & typeof saleDetails).products =
                saleDetails;
        }
        return salesList as SaleWithProducts[];
    }),
    /**
     * Get list of products.
     */
    products: protectedProcedure.query(async ({ ctx }) => {
        return await getProductsListForSales(ctx.user.id);
    }),
    /**
     * Add a new sale.
     */
    add: protectedProcedure
        .input(salesInputValidation)
        .mutation(async ({ ctx, input }) => {
            const productList = input.products.map((p) => p.productId);
            const dbProductList = await getGoodInfoByIds(
                ctx.user.id,
                productList,
            );

            const dbProducts: {
                id: string;
                retailPrice: number;
                quantity: number;
            }[] = dbProductList.map((product) => ({
                id: product.id,
                retailPrice: product.retailPrice,
                quantity: product.inventoryQuantity ?? 0,
            }));

            if (isProductsError(input, dbProducts)) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "One or more products are invalid",
                    cause: { field: "products" },
                });
            }

            if (isTotalPriceError(input)) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Total price cannot be negative",
                    cause: { field: "totalPrice" },
                });
            }

            const statusInfo = await getStatusByKey(input.statusKey);

            await db.transaction(async (tx) => {
                const inputData: SaleInsert = {
                    id: "",
                    userId: ctx.user.id,
                    customer: input.customer,
                    salesNumber: input.salesNumber,
                    channelId: input.channelId,
                    date: input.date ? new Date(input.date) : new Date(),
                    statusId: statusInfo!.id,
                    totalPrice: input.totalPrice,
                    note: input.note,
                    discount: input.discount,
                    shippingFee: input.shippingFee,
                    taxPercentage: input.taxPercentage,
                };
                const saledata = await addSale(inputData, tx);

                let totalCogs = 0;
                for (const product of input.products) {
                    const dbProduct = dbProductList.find(
                        (p) => p.id === product.productId,
                    );
                    const cogs =
                        (Number(dbProduct?.laborCost ?? 0) +
                            Number(dbProduct?.materialCost ?? 0) +
                            Number(dbProduct?.overheadCost ?? 0)) *
                        product.quantity;
                    totalCogs += cogs;

                    const inputSaleDetail: SaleDetailInsert = {
                        id: "",
                        saleId: saledata[0].id,
                        goodId: product.productId,
                        quantity: product.quantity,
                        pricePerItem: product.retailPrice,
                        cogs: cogs,
                    };
                    await addSaleDetail(inputSaleDetail, tx);
                    await increaseDecreaseInventoryQuantity(
                        product.productId,
                        -product.quantity,
                        tx,
                    );
                }

                await updateSale(
                    {
                        ...inputData,
                        id: saledata[0].id,
                        cogs: totalCogs,
                        profit: input.totalPrice - totalCogs,
                    },
                    tx,
                );
            });

            return { success: true };
        }),
    /**
     * Update selected sale.
     */
    update: protectedProcedure
        .input(salesUpdateValidation)
        .mutation(async ({ ctx, input }) => {
            const productList = input.products.map((p) => p.productId);
            const dbProductList = await getGoodInfoByIds(
                ctx.user.id,
                productList,
            );
            const existingSaleDetails = await getSaleDetailsBySaleId(input.id);

            const dbProducts: {
                id: string;
                retailPrice: number;
                quantity: number;
            }[] = dbProductList.map((product) => {
                const existingDetail = existingSaleDetails.find(
                    (detail) => detail.goodId === product.id,
                );
                return {
                    id: product.id,
                    retailPrice: product.retailPrice,
                    quantity: existingDetail
                        ? (product.inventoryQuantity ?? 0) +
                          existingDetail.quantity
                        : (product.inventoryQuantity ?? 0),
                };
            });

            await db.transaction(async (tx) => {
                if (isProductsError(input, dbProducts)) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "One or more products are invalid",
                        cause: { field: "products" },
                    });
                }

                if (isTotalPriceError(input)) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Total price cannot be negative",
                        cause: { field: "totalPrice" },
                    });
                }

                const saleDetails = await getSaleDetailsBySaleId(input.id, tx);
                for (const detail of saleDetails) {
                    await increaseDecreaseInventoryQuantity(
                        detail.goodId,
                        detail.quantity,
                        tx,
                    );
                }

                const statusInfo = await getStatusByKey(input.statusKey);

                let totalCogs = 0;
                for (const product of input.products) {
                    const dbProduct = dbProductList.find(
                        (p) => p.id === product.productId,
                    );
                    const cogs =
                        (Number(dbProduct?.laborCost ?? 0) +
                            Number(dbProduct?.materialCost ?? 0) +
                            Number(dbProduct?.overheadCost ?? 0)) *
                        product.quantity;
                    totalCogs += cogs;
                }

                const updateData: SaleInsert = {
                    id: input.id,
                    userId: ctx.user.id,
                    customer: input.customer,
                    salesNumber: input.salesNumber,
                    channelId: input.channelId,
                    date: input.date ? new Date(input.date) : new Date(),
                    statusId: statusInfo!.id,
                    totalPrice: input.totalPrice,
                    cogs: totalCogs,
                    profit: input.totalPrice - totalCogs,
                    note: input.note,
                    discount: input.discount,
                    shippingFee: input.shippingFee,
                    taxPercentage: input.taxPercentage,
                };
                await updateSale(updateData, tx);

                await deleteSaleDetailsBySaleId(input.id, tx);

                for (const product of input.products) {
                    const dbProduct = dbProductList.find(
                        (p) => p.id === product.productId,
                    );
                    const cogs =
                        (Number(dbProduct?.laborCost ?? 0) +
                            Number(dbProduct?.materialCost ?? 0) +
                            Number(dbProduct?.overheadCost ?? 0)) *
                        product.quantity;

                    const inputSaleDetail: SaleDetailInsert = {
                        id: "",
                        saleId: input.id,
                        goodId: product.productId,
                        quantity: product.quantity,
                        pricePerItem: product.retailPrice,
                        cogs: cogs,
                    };
                    await addSaleDetail(inputSaleDetail, tx);
                    await increaseDecreaseInventoryQuantity(
                        product.productId,
                        -product.quantity,
                        tx,
                    );
                }
            });

            return { success: true };
        }),
    /**
     * Delete a sale.
     */
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await db.transaction(async (tx) => {
                const saleDetails = await getSaleDetailsBySaleId(input.id, tx);
                for (const detail of saleDetails) {
                    await increaseDecreaseInventoryQuantity(
                        detail.goodId,
                        detail.quantity,
                        tx,
                    );
                }
                await deleteSale(input.id, tx);
            });
            return { success: true };
        }),
    /**
     * Get the next sales number.
     */
    nextSalesNumber: protectedProcedure.query(async ({ ctx }) => {
        const maxNumber = await getMaxSalesNumber(ctx.user.id);
        return maxNumber + 1;
    }),
    /**
     * Get the used materials per sales.
     */
    usedMaterialPerSales: protectedProcedure.query(async ({ ctx }) => {
        const usedMaterials = await getUsedMaterialPerSales(ctx.user.id);
        return usedMaterials;
    }),
    metricTotalRevenue: protectedProcedure
        .input(salesMetricValidation)
        .query(async ({ ctx, input }) => {
            const [currentMonth, lastMonth] = await Promise.all([
                getMonthlySalesRevenue(ctx.user.id, input.timezone, 0),
                getMonthlySalesRevenue(ctx.user.id, input.timezone, -1),
            ]);
            return {
                totalRevenue: currentMonth.totalRevenue,
                change:
                    lastMonth.totalRevenue === 0
                        ? null
                        : ((currentMonth.totalRevenue -
                              lastMonth.totalRevenue) /
                              lastMonth.totalRevenue) *
                          100,
                totalProfit: currentMonth.totalProfit,
                profitChange:
                    lastMonth.totalProfit === 0
                        ? null
                        : ((currentMonth.totalProfit - lastMonth.totalProfit) /
                              lastMonth.totalProfit) *
                          100,
            };
        }),
    metricTotalSalesCount: protectedProcedure
        .input(salesMetricValidation)
        .query(async ({ ctx, input }) => {
            const [currentMonth, lastMonth] = await Promise.all([
                getMonthlySalesCount(ctx.user.id, input.timezone, 0),
                getMonthlySalesCount(ctx.user.id, input.timezone, -1),
            ]);
            return {
                totalSalesCount: currentMonth,
                change:
                    lastMonth === 0
                        ? null
                        : ((currentMonth - lastMonth) / lastMonth) * 100,
            };
        }),
});
