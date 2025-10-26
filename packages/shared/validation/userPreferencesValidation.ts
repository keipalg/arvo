import { z } from "zod";

export const userPreferencesInputValidation = z.object({
    profitPercentage: z
        .number("Profit Percentage must be a number.")
        .min(0, "Profit Percentage must be a positive value.")
        .optional(),
    laborCost: z
        .number("Labor cost must be a number.")
        .min(0, "Labor cost must be a positive value.")
        .optional(),
    estimatedMonthlyOperatingExpenses: z.number().min(0).optional(),
    estimatedMonthlyProducedUnits: z.number().optional(),
    operatingCostPercentage: z.number().min(0).optional(),
    overheadCostPercentage: z.number().min(0).optional(),
});
export type UserPreferencesValidationForm = z.infer<
    typeof userPreferencesInputValidation
>;

export const userPreferenceProfitValidation = z.object({
    profitPercentage: z
        .number("Profit Percentage must be a number.")
        .min(0, "Profit Percentage must be a positive value."),
});

export const userPreferenceLaborValidation = z.object({
    laborCost: z
        .number("Labor cost must be a number.")
        .min(0, "Labor cost must be a positive value."),
});

export const userPreferenceOperatingCostValidation = z.object({
    estimatedMonthlyOperatingExpenses: z
        .number("Estimated Monthly Operating Expenses must be a number.")
        .min(1, "Estimated Monthly Produced Units must be at least 1.")
        .positive(
            "Estimated Monthly Operating Expenses must be a positive value.",
        ),
    estimatedMonthlyProducedUnits: z
        .number("Estimated Monthly Produced Units must be a number.")
        .int("Estimated Monthly Produced Units must be a whole number.")
        .min(1, "Estimated Monthly Produced Units must be at least 1."),
    operatingCostPercentage: z
        .number("Operating Cost must be a number.")
        .min(0, "Operating Cost must be a positive value."),
});

export const userPreferenceOverheadCostValidation = z.object({
    overheadCostPercentage: z
        .number("Overhead Cost Percentage must be a number.")
        .min(0, "Overhead Cost Percentage must be a positive value."),
});
