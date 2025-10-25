import { z } from "zod";
import { protectedProcedure, router } from "./trpcBase.js";
import {
    getUserPreferences,
    updateUserPreferences,
} from "../service/userPreferencesService.js";

export const userPreferencesRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await getUserPreferences(ctx.user.id);
    }),
    updateProfit: protectedProcedure
        .input(z.object({ profitPercentage: z.number() })) // TODO: To update on frontend task
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                profitPercentage: input.profitPercentage,
            });
        }),
    updateLabor: protectedProcedure
        .input(z.object({ laborCost: z.number() })) // TODO: To update on frontend task
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                laborCost: input.laborCost,
            });
        }),
    updateOperatingCost: protectedProcedure
        .input(
            z.object({
                estimatedMonthlyOperatingExpenses: z.number(),
                estimatedMonthlyProducedUnits: z.number(),
                operatingCostPercentage: z.number(),
            }), // TODO: To update on frontend task
        )
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                estimatedMonthlyOperatingExpenses:
                    input.estimatedMonthlyOperatingExpenses,
                estimatedMonthlyProducedUnits:
                    input.estimatedMonthlyProducedUnits,
                operatingCostPercentage: input.operatingCostPercentage,
            });
        }),
    updateOverheadCost: protectedProcedure
        .input(z.object({ overheadCostPercentage: z.number() })) // TODO: To update on frontend task
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                overheadCostPercentage: input.overheadCostPercentage,
            });
        }),
});
