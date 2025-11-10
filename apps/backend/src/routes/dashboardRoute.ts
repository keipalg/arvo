import {
    dashboardRevenueProfitSummaryOverviewValidation,
    dashboardTimezoneValidation,
    dashboardSellingItemsTableValidation,
    dashboardRevenueProfitSummary6MonthsOverviewValidation,
    productionInOutOverviewValidation,
} from "@arvo/shared";
import {
    generateProductionInOutOverview,
    generateRevenueProfitSummary6MonthsOverview,
    generateRevenueProfitSummaryOverview,
} from "../service/dashboardOverviewService.js";
import { getMonthlySalesRevenue } from "../service/salesService.js";
import {
    getLeastSellingProducts,
    getLeastSellingProductWithComparison,
    getMonthlyMaterialExpense,
    getMonthlyProductionCount,
    getTotalProductsSold as getMonthlyProductsSold,
    getMonthlyReveneueLast6Months,
    getMonthlyTotalBusinessExpenses,
    getMostSellingProductWithComparison,
    getTopSellingProducts,
    getMonthlyBusinessExpenseWithType as getTotalMonthlyBusinessExpenses,
} from "../service/dashboardService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import {
    MaterialExpenseTypes,
    OperationalExpenseTypes,
} from "../utils/constants/expenseTypes.js";

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
                totalRevenue: Number(sales.totalRevenue),
                totalExpenses: Number(businessExpense + materialExpense),
                totalProfit: Number(sales.totalProfit),
            };
        }),
    revenueProfitSummaryOverview: protectedProcedure
        .input(dashboardRevenueProfitSummaryOverviewValidation)
        .query(async ({ ctx, input }) => {
            const overview = await generateRevenueProfitSummaryOverview({
                userId: ctx.user.id,
                totalRevenue: input.totalRevenue,
                totalExpenses: input.totalExpenses,
                totalProfit: input.totalProfit,
            });
            return {
                overview: overview,
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
    revenueProfitSummary6MonthsOverview: protectedProcedure
        .input(dashboardRevenueProfitSummary6MonthsOverviewValidation)
        .query(async ({ ctx, input }) => {
            const overview = await generateRevenueProfitSummary6MonthsOverview(
                ctx.user.id,
                input.revenueProfitSummary6MonthsData,
            );
            return {
                overview: overview,
            };
        }),
    topSellingProducts: protectedProcedure
        .input(dashboardSellingItemsTableValidation)
        .query(async ({ ctx, input }) => {
            const [totalProductsSold, topSellingProducts] = await Promise.all([
                getMonthlyProductsSold(ctx.user.id, input.timezone),
                getTopSellingProducts(ctx.user.id, input.timezone, input.limit),
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
        .input(dashboardSellingItemsTableValidation)
        .query(async ({ ctx, input }) => {
            const [totalProductsSold, lowSellingProducts] = await Promise.all([
                getMonthlyProductsSold(ctx.user.id, input.timezone),
                getLeastSellingProducts(
                    ctx.user.id,
                    input.timezone,
                    input.limit,
                ),
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

            const totalBusinessExpensesWithLabel = totalBusinessExpenses.map(
                (expense) => ({
                    expenceType: expense.expenceType,
                    expenseTypeLabel: String(
                        OperationalExpenseTypes[expense.expenceType].label,
                    ),
                    totalExpense: expense.totalExpense,
                }),
            );

            const expenseBreakdown = [
                ...totalBusinessExpensesWithLabel,
                {
                    expenceType: MaterialExpenseTypes.materials,
                    expenseTypeLabel: String(
                        MaterialExpenseTypes.materials.label,
                    ),
                    totalExpense: totalMaterialExpense,
                },
            ];

            const sortedExpenseBreakdown = expenseBreakdown.sort(
                (a, b) =>
                    Number(b.totalExpense ?? 0) - Number(a.totalExpense ?? 0),
            );

            return sortedExpenseBreakdown;
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
    productionInOutOverview: protectedProcedure
        .input(productionInOutOverviewValidation)
        .query(async ({ ctx, input }) => {
            const overview = await generateProductionInOutOverview(
                ctx.user.id,
                input.totalProduced,
                input.totalSold,
            );
            return {
                overview: overview,
            };
        }),
});
