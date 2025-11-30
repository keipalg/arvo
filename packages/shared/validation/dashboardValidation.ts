import { z } from "zod";

export const dashboardTimezoneValidation = z.object({
    timezone: z.string().refine((tz) => {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
        } catch (e) {
            return false;
        }
    }),
});

export const dashboardRevenueProfitSummaryOverviewValidation = z.object({
    totalRevenue: z.number(),
    totalExpenses: z.number(),
    totalProfit: z.number(),
});

export const dashboardRevenueProfitSummary6MonthsOverviewValidation = z.object({
    revenueProfitSummary6MonthsData: z.array(
        z.object({
            month: z.string(),
            totalRevenue: z.number(),
            totalExpenses: z.number(),
            totalProfit: z.number(),
        }),
    ),
});

export const dashboardSellingItemsTableValidation = z.object({
    limit: z.number().min(1).max(20).optional(),
    timezone: z.string().refine((tz) => {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
        } catch (e) {
            return false;
        }
    }),
});

export const productionInOutOverviewValidation = z.object({
    totalProduced: z.number(),
    totalSold: z.number(),
});

export const dashboardExpenseBreakdownOverviewValidation = z.object({
    expenseBreakdownData: z.array(
        z.object({
            expenseType: z.string(),
            expenseTypeLabel: z.string(),
            totalExpense: z.number(),
        }),
    ),
});

export type DashboardTimezoneInput = z.infer<
    typeof dashboardTimezoneValidation
>;

export type DashboardRevenueProfitSummaryOverviewInput = z.infer<
    typeof dashboardRevenueProfitSummaryOverviewValidation
>;
