import {
    userPreferenceLaborValidation,
    userPreferenceOperatingCostValidation,
    userPreferenceOverheadCostValidation,
    userPreferenceProfitValidation,
} from "@arvo/shared";
import {
    getUserPreferences,
    updateUserPreferences,
} from "../service/userPreferencesService.js";
import { DEFAULT_PROFIT_MARGIN_PCT } from "../utils/constants/accounting.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const userPreferencesRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await getUserPreferences(ctx.user.id);
    }),
    updateProfit: protectedProcedure
        .input(userPreferenceProfitValidation)
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                profitPercentage: input.profitPercentage
                    ? input.profitPercentage / 100
                    : DEFAULT_PROFIT_MARGIN_PCT,
            });
        }),
    updateLabor: protectedProcedure
        .input(userPreferenceLaborValidation)
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                laborCost: input.laborCost,
            });
        }),
    updateOperatingCost: protectedProcedure
        .input(userPreferenceOperatingCostValidation)
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
        .input(userPreferenceOverheadCostValidation)
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                overheadCostPercentage: input.overheadCostPercentage / 100,
            });
        }),
});
