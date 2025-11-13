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
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
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
                setVisibleToast(true);
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Success! Business settings have been updated.",
                });
            },
            onError: (error) => {
                console.error("Error updating business settings:", error);
                setVisibleToast(true);
                setToastMessage({
                    kind: "WARN",
                    content:
                        "Failed to update business settings. Please try again.",
                });
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
            label: "Operating Cost ",
            tooltip:
                "The day-to-day expenses required to run your business, not directly linked to producing each product.",
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
            label: "Monthly Production Estimate",
            tooltip:
                "The projected number of product units you plan to produce each month to meet demand and manage inventory.",
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
            label: "Operating Cost per Product",
            tooltip:
                " The day-to-day expenses required to run your business, allocated to each individual product, excluding costs directly tied to production.",
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
            tooltip:
                "The total cost of wages and benefits for the staff involved in production and other business operations.",
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
            tooltip:
                "Ongoing operational expenses of running your business, including rent, utilities, marketing, and other fixed costs.",
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
            tooltip:
                "The percentage of revenue remaining after all costs and expenses are deducted, indicating the profitability of your products.",
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
            visibleToast={visibleToast}
            setVisibleToast={setVisibleToast}
            toastMessage={toastMessage}
        />
    );
};
