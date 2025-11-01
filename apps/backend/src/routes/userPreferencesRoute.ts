import {
    userPreferenceLaborValidation,
    userPreferenceOperatingCostValidation,
    userPreferenceOverheadCostValidation,
    userPreferenceProfitValidation,
    userPreferencesInputValidation,
} from "@arvo/shared";
import {
    createUserPreferences,
    getUserPreferences,
    updateUserPreferences,
} from "../service/userPreferencesService.js";
import { DEFAULT_PROFIT_MARGIN_PCT } from "../utils/constants/accounting.js";
import { protectedProcedure, router } from "./trpcBase.js";
import z from "zod";

export const userPreferencesRouter = router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        await createUserPreferences(ctx.user.id);
    }),
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
    completeSetup: protectedProcedure.mutation(async ({ ctx }) => {
        await updateUserPreferences(ctx.user.id, {
            hasCompletedSetup: true,
        });
    }),
    updateLowInventoryAlert: protectedProcedure
        .input(
            z.object({
                lowInventoryAlertForGoods: z.boolean(),
                lowInventoryAlertForMaterials: z.boolean(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                lowInventoryAlertForGoods: input.lowInventoryAlertForGoods,
                lowInventoryAlertForMaterials:
                    input.lowInventoryAlertForMaterials,
            });
        }),
    updateUserPreferences: protectedProcedure
        .input(userPreferencesInputValidation)
        .mutation(async ({ ctx, input }) => {
            await updateUserPreferences(ctx.user.id, {
                ...input,
            });
        }),
});
