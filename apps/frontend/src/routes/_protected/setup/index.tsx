import type { UserPreferencesValidationForm } from "@arvo/shared";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SetupStepLaborCost } from "../../../components/setup/SetupStepLaborCost";
import { SetupStepOperatingCost } from "../../../components/setup/SetupStepOperatingCost";
import { SetupStepoverheadCostPercentage } from "../../../components/setup/SetupStepOverheadPercentage";
import { SetupStepProfitMargin } from "../../../components/setup/SetupStepProfitMargin";
import { trpcClient } from "../../../utils/trpcClient";
import { SetupStepMaterialTypes } from "../../../components/setup/SetupStepMaterialType";

export const Route = createFileRoute("/_protected/setup/")({
    beforeLoad: async () => {
        const userPreferences = await trpcClient.userPreferences.get.query();

        if (userPreferences?.hasCompletedSetup) {
            throw redirect({ to: "/settings" });
        }
    },
    component: SetupScreens,
});

function SetupScreens() {
    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState<UserPreferencesValidationForm>({
        profitPercentage: undefined,
        laborCost: undefined,
        estimatedMonthlyOperatingExpenses: undefined,
        estimatedMonthlyProducedUnits: undefined,
        operatingCostPercentage: undefined,
        overheadCostPercentage: undefined,
    });

    useEffect(() => {
        document.title = "Arvo | Welcome";
    }, []);

    const handleSaveAndContinue = () => setCurrentStep((prev) => prev + 1);
    const handleBack = () => setCurrentStep((prev) => prev - 1);

    // Screen array (flexible for adding screens 1-3 later)
    const screens = [
        // TODO Screen for Nature of Business
        // TODO Screen Product Types
        // TODO Screen Material Types
        <SetupStepMaterialTypes
            key="material-types"
            data={formData}
            onUpdate={setFormData}
            onNext={handleSaveAndContinue}
        />,
        <SetupStepProfitMargin
            key="profit-margin"
            data={formData}
            onUpdate={setFormData}
            onNext={handleSaveAndContinue}
            onBack={handleBack}
        />,
        <SetupStepLaborCost
            key="labor-cost"
            data={formData}
            onUpdate={setFormData}
            onNext={handleSaveAndContinue}
            onBack={handleBack}
        />,
        <SetupStepOperatingCost
            key="operating-cost"
            data={formData}
            onUpdate={setFormData}
            onNext={handleSaveAndContinue}
            onBack={handleBack}
        />,
        <SetupStepoverheadCostPercentage
            key="operating-cost"
            data={formData}
            onUpdate={setFormData}
            onNext={handleSaveAndContinue}
            onBack={handleBack}
        />,
    ];

    return <>{screens[currentStep]}</>;
}
