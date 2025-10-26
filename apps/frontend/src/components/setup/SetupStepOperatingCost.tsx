import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
    userPreferenceOperatingCostValidation,
    type UserPreferencesValidationForm,
} from "shared/validation/userPreferencesValidation";
import { trpc } from "../../utils/trpcClient";
import NumberInput from "../input/NumberInput";
import SetupLayout from "./SetupLayout";

type SetupStepOperatingCostProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext: () => void;
    onBack?: () => void;
};

export function SetupStepOperatingCost({
    data,
    onUpdate,
    onNext,
    onBack,
}: SetupStepOperatingCostProps) {
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [
        estimatedMonthlyOperatingExpenses,
        setEstimatedMonthlyOperatingExpenses,
    ] = useState(data.estimatedMonthlyOperatingExpenses ?? 0);
    const [estimatedMonthlyProducedUnits, setEstimatedMonthlyProducedUnits] =
        useState(data.estimatedMonthlyProducedUnits ?? 0);

    const updateOperatingCostMutation = useMutation(
        trpc.userPreferences.updateOperatingCost.mutationOptions({
            onSuccess: () => {
                onNext();
            },
        }),
    );
    const operatingCostPercentage =
        estimatedMonthlyProducedUnits > 0
            ? estimatedMonthlyOperatingExpenses / estimatedMonthlyProducedUnits
            : 0;

    const handleSaveAndContinue = () => {
        const result = userPreferenceOperatingCostValidation.safeParse({
            estimatedMonthlyOperatingExpenses,
            estimatedMonthlyProducedUnits,
            operatingCostPercentage,
        });

        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                if (issue.path.length > 0) {
                    errors[issue.path[0] as string] = issue.message;
                }
            });
            console.log(errors);
            setFormErrors(errors);
            return;
        }

        onUpdate({
            ...data,
            estimatedMonthlyOperatingExpenses,
            estimatedMonthlyProducedUnits,
            operatingCostPercentage,
        });

        updateOperatingCostMutation.mutate(result.data);
    };

    return (
        <SetupLayout
            title="How much do you usually spend (or plan to spend) each month on business expenses?"
            subtitle="We’ll calculate based from your rent / studio space fees + admin fees + marketing and more, divided by items you make each month."
            onContinue={handleSaveAndContinue}
            caption={`We'll add your operating cost value of $${operatingCostPercentage.toFixed(2)} per item when pricing your products. You can always change this later in Settings.`}
            onBack={onBack}
        >
            <NumberInput
                label="Estimate your monthly operating expenses. (e.g. $ 400)"
                value={estimatedMonthlyOperatingExpenses}
                onChange={(e) =>
                    setEstimatedMonthlyOperatingExpenses(
                        parseFloat(e.target.value) || 0,
                    )
                }
                placeholder="00"
                unit="$"
                error={formErrors.estimatedMonthlyOperatingExpenses}
            />
            <NumberInput
                label="Estimate products created per month. (e.g. 20 items)"
                value={estimatedMonthlyProducedUnits}
                onChange={(e) =>
                    setEstimatedMonthlyProducedUnits(
                        parseFloat(e.target.value) || 0,
                    )
                }
                placeholder="00 items"
                error={formErrors.estimatedMonthlyProducedUnits}
            />
        </SetupLayout>
    );
}
