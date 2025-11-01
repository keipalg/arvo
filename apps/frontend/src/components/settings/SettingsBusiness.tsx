import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";
import { SettingsLayout, type SettingsData } from "./SettingsLayout";
import { useEffect, useState } from "react";

type SettingsFormData = {
    estimatedMonthlyOperatingExpenses: number;
    estimatedMonthlyProducedUnits: number;
    operatingCostPercentage: number;
    laborCost: number;
    overheadCostPercentage: number;
    profitPercentage: number;
};

export const SettingsBusiness = () => {
    const { data: userPreferences, isLoading: isLoadingUserPreferences } =
        useQuery(trpc.userPreferences.get.queryOptions());

    const [settingsForm, setSettingsForm] = useState<SettingsFormData>({
        estimatedMonthlyOperatingExpenses: 0,
        estimatedMonthlyProducedUnits: 0,
        operatingCostPercentage: 0,
        laborCost: 0,
        overheadCostPercentage: 0,
        profitPercentage: 0,
    });
    console.log("settingsForm", settingsForm);

    const updateLowInventoryAlertMutation = useMutation(
        trpc.userPreferences.updateUserPreferences.mutationOptions({
            onSuccess: () => {
                console.log("Business settings updated successfully");
            },
        }),
    );

    useEffect(() => {
        if (userPreferences) {
            setSettingsForm({
                estimatedMonthlyOperatingExpenses:
                    userPreferences.estimatedMonthlyOperatingExpenses ?? 0,
                estimatedMonthlyProducedUnits:
                    userPreferences.estimatedMonthlyProducedUnits ?? 0,
                operatingCostPercentage:
                    userPreferences.operatingCostPercentage ?? 0,
                laborCost: userPreferences.laborCost ?? 0,
                overheadCostPercentage:
                    userPreferences.overheadCostPercentage ?? 0,
                profitPercentage: userPreferences.profitPercentage ?? 0,
            });
        }
    }, [userPreferences]);

    if (isLoadingUserPreferences) return <div>Loading...</div>;
    if (!userPreferences) return <div>No user preferences found.</div>;

    const settingsData: SettingsData = [
        {
            label: "Operating Cost (Estimated Monthly Total Expenses)",
            type: "money",
            value: settingsForm.estimatedMonthlyOperatingExpenses,
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    estimatedMonthlyOperatingExpenses:
                        parseFloat(e.target.value) || 0,
                    operatingCostPercentage: (() => {
                        const producedUnits =
                            settingsForm.estimatedMonthlyProducedUnits || 1;
                        const value = parseFloat(e.target.value) || 0;
                        return Math.round((value / producedUnits) * 100) / 100;
                    })(),
                })),
        },
        {
            label: "(Estimated Monthly Produced Units)",
            type: "item",
            value: settingsForm.estimatedMonthlyProducedUnits,
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    estimatedMonthlyProducedUnits:
                        parseFloat(e.target.value) || 0,
                    operatingCostPercentage: (() => {
                        const producedUnits =
                            settingsForm.estimatedMonthlyProducedUnits || 1;
                        const value = parseFloat(e.target.value) || 0;
                        return Math.round((value / producedUnits) * 100) / 100;
                    })(),
                })),
        },
        {
            label: "(Estimated Operating Cost per Goods)",
            type: "money",
            value: settingsForm.operatingCostPercentage,
            disabled: true,
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    operatingCostPercentage: (() => {
                        const producedUnits =
                            settingsForm.estimatedMonthlyProducedUnits || 1;
                        const value = parseFloat(e.target.value) || 0;
                        return Math.round((value / producedUnits) * 100) / 100;
                    })(),
                })),
        },
        {
            label: "Labor Cost",
            type: "money",
            value: settingsForm.laborCost,
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    laborCost: parseFloat(e.target.value) || 0,
                })),
        },
        {
            label: "Studio Overhead",
            type: "percentage",
            value: settingsForm.overheadCostPercentage,
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    overheadCostPercentage:
                        parseFloat(e.target.value) / 100 || 0,
                })),
        },
        {
            label: "Profit Margin",
            type: "percentage",
            value: settingsForm.profitPercentage,
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    profitPercentage: parseFloat(e.target.value) / 100 || 0,
                })),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateLowInventoryAlertMutation.mutate({
            profitPercentage: settingsForm.profitPercentage,
            laborCost: settingsForm.laborCost,
            estimatedMonthlyOperatingExpenses:
                settingsForm.estimatedMonthlyOperatingExpenses,
            estimatedMonthlyProducedUnits:
                settingsForm.estimatedMonthlyProducedUnits,
            operatingCostPercentage: settingsForm.operatingCostPercentage,
            overheadCostPercentage: settingsForm.overheadCostPercentage,
        });
    };

    return (
        <SettingsLayout
            title="Business Setting"
            tagline="Configure your business settings to suit your operations."
            settingsData={settingsData}
            handleSubmit={handleSubmit}
        />
    );
};
