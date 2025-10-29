import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { UserPreferencesValidationForm } from "@arvo/shared";
import { SetupStepProfitMargin } from "../../../components/setup/SetupStepProfitMargin";
import { SetupStepLaborCost } from "../../../components/setup/SetupStepLaborCost";
import { SetupStepOperatingCost } from "../../../components/setup/SetupStepOperatingCost";
import { SetupStepoverheadCostPercentage } from "../../../components/setup/SetupStepOverheadPercentage";

export const Route = createFileRoute("/_protected/setup/")({
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

    const handleSaveAndContinue = () => setCurrentStep((prev) => prev + 1);
    const handleBack = () => setCurrentStep((prev) => prev - 1);

    // Screen array (flexible for adding screens 1-3 later)
    const screens = [
        // TODO Screen for Nature of Business
        // TODO Screen Product Types
        // TODO Screen Material Types
        <SetupStepProfitMargin
            key="profit-margin"
            data={formData}
            onUpdate={setFormData}
            onNext={handleSaveAndContinue}
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
