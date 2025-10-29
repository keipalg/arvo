import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
    userPreferenceProfitValidation,
    type UserPreferencesValidationForm,
} from "@arvo/shared";
import { trpc } from "../../utils/trpcClient";
import RadioCustom from "../input/RadioCustom";
import SetupLayout from "./SetupLayout";

type SetupStepProfitMarginProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext: () => void;
};

export function SetupStepProfitMargin({
    data,
    onUpdate,
    onNext,
}: SetupStepProfitMarginProps) {
    const options = [
        { value: "50", label: "50%" },
        { value: "30", label: "30%" },
        { value: "25", label: "25%" },
    ];
    const CUSTOM_INPUT_VALUE = "custom";
    const optionValues = options.map((opt) => parseFloat(opt.value));
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState(() => {
        if (data.profitPercentage === undefined) return options[0].value;
        if (optionValues.includes(data.profitPercentage))
            return data.profitPercentage.toString();
        return CUSTOM_INPUT_VALUE;
    });
    const [customValue, setCustomValue] = useState(() => {
        if (data.profitPercentage === undefined) return 0;
        if (optionValues.includes(data.profitPercentage)) return 0;
        return data.profitPercentage;
    });

    useEffect(() => {
        if (data.profitPercentage === undefined) {
            onUpdate({
                ...data,
                profitPercentage: parseFloat(options[0].value),
            });
        }
    }, []);

    const updateProfitMutation = useMutation(
        trpc.userPreferences.updateProfit.mutationOptions({
            onSuccess: () => {
                onNext();
            },
        }),
    );

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setCustomValue(0);
        onUpdate({ ...data, profitPercentage: parseFloat(value) });
        setFormErrors({});
    };

    const handleCustomChange = (value: string) => {
        setSelectedOption(CUSTOM_INPUT_VALUE);
        setCustomValue(parseFloat(value));
        onUpdate({ ...data, profitPercentage: parseFloat(value) });
    };

    const handleContinue = () => {
        if (selectedOption === CUSTOM_INPUT_VALUE && customValue === 0) {
            setFormErrors({
                profitPercentage: "Please enter a custom profit percentage.",
            });
            return;
        }
        const profitValue = data.profitPercentage;

        const result = userPreferenceProfitValidation.safeParse({
            profitPercentage: profitValue,
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

        updateProfitMutation.mutate(result.data);
    };

    return (
        <SetupLayout
            title="What is your expected product profit margin?"
            subtitle="No worries if you don't have a number, we'll set a default of 50%."
            onContinue={handleContinue}
            caption="You can always change this later in Settings."
        >
            <RadioCustom
                name="profit"
                options={options}
                selectedValue={selectedOption}
                onChange={handleOptionChange}
                columns={2}
                customInput={
                    <label className="flex items-center gap-2 cursor-pointer w-full h-full">
                        <input
                            type="radio"
                            name="profit"
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
                            placeholder="Type custom percentage %"
                            className="flex-1 outline-none bg-transparent h-full"
                            onClick={() =>
                                setSelectedOption(CUSTOM_INPUT_VALUE)
                            }
                        />
                    </label>
                }
                error={formErrors.profitPercentage}
            />
        </SetupLayout>
    );
}
