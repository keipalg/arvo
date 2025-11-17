import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
    userPreferenceLaborValidation,
    type UserPreferencesValidationForm,
} from "@arvo/shared";
import { trpc } from "../../utils/trpcClient";
import RadioCustom from "../input/RadioCustom";
import SetupLayout from "./SetupLayout";

type SetupStepLaborCostProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext: () => void;
    onBack?: () => void;
};

export function SetupStepLaborCost({
    data,
    onUpdate,
    onNext,
    onBack,
}: SetupStepLaborCostProps) {
    const options = [
        { value: "10", label: "$ 10" },
        { value: "15", label: "$ 15" },
        { value: "20", label: "$ 20" },
    ];
    const CUSTOM_INPUT_VALUE = "custom";
    const optionValues = options.map((opt) => parseFloat(opt.value));
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState(() => {
        if (data.laborCost === undefined) return options[0].value;
        if (optionValues.includes(data.laborCost))
            return data.laborCost.toString();
        return CUSTOM_INPUT_VALUE;
    });
    const [customValue, setCustomValue] = useState(() => {
        if (data.laborCost === undefined) return 0;
        if (optionValues.includes(data.laborCost)) return 0;
        return data.laborCost;
    });

    useEffect(() => {
        if (data.laborCost === undefined) {
            onUpdate({ ...data, laborCost: parseFloat(options[0].value) });
        }
    }, []);

    const updateLaborMutation = useMutation(
        trpc.userPreferences.updateLabor.mutationOptions({
            onSuccess: () => {
                onNext();
            },
        }),
    );

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setCustomValue(0);
        onUpdate({ ...data, laborCost: parseFloat(value) });
        setFormErrors({});
    };

    const handleCustomChange = (value: string) => {
        setSelectedOption(CUSTOM_INPUT_VALUE);
        setCustomValue(parseFloat(value));
        onUpdate({ ...data, laborCost: parseFloat(value) });
    };

    const handleSaveAndContinue = () => {
        if (selectedOption === CUSTOM_INPUT_VALUE && customValue === 0) {
            setFormErrors({
                laborCost: "Please enter a custom labor cost.",
            });
            return;
        }

        const laborValue = data.laborCost;

        const result = userPreferenceLaborValidation.safeParse({
            laborCost: laborValue,
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

        updateLaborMutation.mutate(result.data);
    };

    return (
        <SetupLayout
            title="How much would you pay yourself for making one of your products?"
            subtitle="Tip: Think of what you’d like to earn aside from profit for making each item (e.g., $10 per mug)."
            onContinue={handleSaveAndContinue}
            caption="You can always change this later in Settings."
            onBack={onBack}
        >
            <RadioCustom
                name="labor"
                options={options}
                selectedValue={selectedOption}
                onChange={handleOptionChange}
                customInput={
                    <label className="flex items-center gap-2 cursor-pointer w-full h-full">
                        <input
                            type="radio"
                            name="labor"
                            checked={selectedOption === CUSTOM_INPUT_VALUE}
                            onChange={() =>
                                setSelectedOption(CUSTOM_INPUT_VALUE)
                            }
                            className="cursor-pointer flex-shrink-0"
                        />
                        <input
                            type="number"
                            value={customValue || ""}
                            onChange={(e) => handleCustomChange(e.target.value)}
                            placeholder="Type custom amount $"
                            className="flex-1 outline-none bg-transparent h-full"
                            onClick={() =>
                                setSelectedOption(CUSTOM_INPUT_VALUE)
                            }
                        />
                    </label>
                }
                error={formErrors.laborCost}
            />
        </SetupLayout>
    );
}
