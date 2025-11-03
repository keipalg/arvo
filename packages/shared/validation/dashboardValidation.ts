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

export type DashboardTimezoneInput = z.infer<
    typeof dashboardTimezoneValidation
>;

export type DashboardRevenueProfitSummaryOverviewInput = z.infer<
    typeof dashboardRevenueProfitSummaryOverviewValidation
>;
