import {
    getMonthlySalesCount,
    getMonthlySalesRevenue,
} from "src/service/salesService.js";
import {
    getMonthlyMaterialExpense,
    getLeastSellingProducts,
    getMonthlyReveneueLast6Months,
    getTopSellingProducts,
    getMostSellingProductWithComparison,
    getLeastSellingProductWithComparison,
    getTotalProductsSold as getMonthlyProductsSold,
    getMonthlyBusinessExpenseWithType as getTotalMonthlyBusinessExpenses,
    getMonthlyTotalBusinessExpenses,
    getMonthlyProductionCount,
} from "../service/dashboardService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { dashboardTimezoneValidation } from "@arvo/shared";

export const dashboardRouter = router({
    revenueProfitSummary: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            const [sales, businessExpense, materialExpense] = await Promise.all(
                [
                    getMonthlySalesRevenue(ctx.user.id, input.timezone, 0),
                    getMonthlyTotalBusinessExpenses(
                        ctx.user.id,
                        input.timezone,
                        0,
                    ),
                    getMonthlyMaterialExpense(ctx.user.id, input.timezone, 0),
                ],
            );
            return {
                totalRevenue: sales.totalRevenue,
                totalExpenses: businessExpense + materialExpense,
                totalProfit: sales.totalProfit,
            };
        }),
    revenueProfitSummary6Months: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            const months = [];
            const currentDate = new Date();
            const formatter = new Intl.DateTimeFormat("en-CA", {
                timeZone: input.timezone,
                year: "numeric",
                month: "2-digit",
            });

            for (let i = 5; i >= 0; i--) {
                const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - i,
                    1,
                );
                months.push(formatter.format(date));
            }

            const data = await getMonthlyReveneueLast6Months(
                ctx.user.id,
                input.timezone,
            );

            const resultMap = new Map(
                (data ?? []).map((d: any) => [
                    String(d.month),
                    {
                        totalRevenue: Number(d.totalRevenue ?? 0),
                        totalProfit: Number(d.totalProfit ?? 0),
                    },
                ]),
            );

            const filled = months.map((m) => {
                const entry = resultMap.get(m) ?? {
                    totalRevenue: 0,
                    totalProfit: 0,
                };
                const profitMargin =
                    entry.totalRevenue === 0
                        ? 0
                        : (entry.totalProfit / entry.totalRevenue) * 100;
                return {
                    month: m,
                    totalRevenue: entry.totalRevenue,
                    totalProfit: entry.totalProfit,
                    profitMargin,
                };
            });

            return filled;
        }),
    topSellingProducts: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            const [totalProductsSold, topSellingProducts] = await Promise.all([
                getMonthlyProductsSold(ctx.user.id, input.timezone),
                getTopSellingProducts(ctx.user.id, input.timezone),
            ]);
            return topSellingProducts.map((product) => ({
                ...product,
                popularityPercentage: product.goodsSold / totalProductsSold,
            }));
        }),

    mostSellingProductWithComparison: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            return await getMostSellingProductWithComparison(
                ctx.user.id,
                input.timezone,
            );
        }),

    lowSellingProducts: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            const [totalProductsSold, lowSellingProducts] = await Promise.all([
                getMonthlyProductsSold(ctx.user.id, input.timezone),
                getLeastSellingProducts(ctx.user.id, input.timezone),
            ]);
            return lowSellingProducts.map((product) => ({
                ...product,
                popularityPercentage: product.goodsSold / totalProductsSold,
            }));
        }),

    leastSellingProductWithComparison: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            return await getLeastSellingProductWithComparison(
                ctx.user.id,
                input.timezone,
            );
        }),

    expenseBreakdown: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            const [totalMaterialExpense, totalBusinessExpenses] =
                await Promise.all([
                    getMonthlyMaterialExpense(ctx.user.id, input.timezone, 0),
                    getTotalMonthlyBusinessExpenses(
                        ctx.user.id,
                        input.timezone,
                    ),
                ]);

            const expenseBreakdown = [
                ...totalBusinessExpenses,
                {
                    expenceType: "material",
                    totalExpense: totalMaterialExpense,
                },
            ];

            return expenseBreakdown;
        }),
    productionInOut: protectedProcedure
        .input(dashboardTimezoneValidation)
        .query(async ({ ctx, input }) => {
            const [totalProduced, totalSold] = await Promise.all([
                getMonthlyProductionCount(ctx.user.id, input.timezone),
                getMonthlyProductsSold(ctx.user.id, input.timezone),
            ]);
            return {
                totalProduced: totalProduced ?? 0,
                totalSold: totalSold ?? 0,
            };
        }),
});
