import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
    userPreferenceOverheadCostValidation,
    type UserPreferencesValidationForm,
} from "@arvo/shared";
import { trpc } from "../../utils/trpcClient";
import RadioCustom from "../input/RadioCustom";
import SetupLayout from "./SetupLayout";
import { useNavigate } from "@tanstack/react-router";
import ToastNotification from "../modal/ToastNotification";

type SetupStepOverheadCostPercentageProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext?: () => void;
    onBack?: () => void;
};

export function SetupStepoverheadCostPercentage({
    data,
    onUpdate,
    onBack,
}: SetupStepOverheadCostPercentageProps) {
    const options = [
        { value: "15", label: "15%" },
        { value: "25", label: "25%" },
        { value: "30", label: "30%" },
    ];
    const navigate = useNavigate();
    const CUSTOM_INPUT_VALUE = "custom";
    const optionValues = options.map((opt) => parseFloat(opt.value));
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({
        kind: "SUCCESS",
        content: "",
    });
    const [selectedOption, setSelectedOption] = useState(() => {
        if (data.overheadCostPercentage === undefined) return options[0].value;
        if (optionValues.includes(data.overheadCostPercentage))
            return data.overheadCostPercentage.toString();
        return CUSTOM_INPUT_VALUE;
    });
    const [customValue, setCustomValue] = useState(() => {
        if (data.overheadCostPercentage === undefined) return 0;
        if (optionValues.includes(data.overheadCostPercentage)) return 0;
        return data.overheadCostPercentage;
    });

    useEffect(() => {
        if (data.overheadCostPercentage === undefined) {
            onUpdate({
                ...data,
                overheadCostPercentage: parseFloat(options[0].value),
            });
        }
    }, []);

    const updateOverheadCostMutation = useMutation(
        trpc.userPreferences.updateOverheadCost.mutationOptions(),
    );

    const completeSetupMutation = useMutation(
        trpc.userPreferences.completeSetup.mutationOptions({
            onSuccess: () => {
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Setup completed! Welcome to Arvo!",
                });
                setVisibleToast(true);

                // Wait for toast to show before navigating
                setTimeout(() => {
                    void navigate({ to: "/" });
                }, 1000);
            },
        }),
    );

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setCustomValue(0);
        onUpdate({ ...data, overheadCostPercentage: parseFloat(value) });
        setFormErrors({});
    };

    const handleCustomChange = (value: string) => {
        setSelectedOption(CUSTOM_INPUT_VALUE);
        setCustomValue(parseFloat(value));
        onUpdate({ ...data, overheadCostPercentage: parseFloat(value) });
    };

    const handleContinue = () => {
        if (selectedOption === CUSTOM_INPUT_VALUE && customValue === 0) {
            setFormErrors({
                overheadCostPercentage:
                    "Please enter a custom overhead cost percentage.",
            });
            return;
        }

        const overheadValue = data.overheadCostPercentage;

        const result = userPreferenceOverheadCostValidation.safeParse({
            overheadCostPercentage: overheadValue,
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

        updateOverheadCostMutation.mutate(result.data, {
            onSuccess: () => {
                completeSetupMutation.mutate();
            },
        });
    };

    return (
        <>
            <SetupLayout
                title="About how much extra do small supplies add to each product's material cost?"
                subtitle="To cover small supplies like brushes and sponges, the recommendation is to add 30% overhead to your material cost — e.g., $2 clay → +$0.60 per item."
                onContinue={handleContinue}
                caption="We'll use this to calculate your product prices. You can always change this later in Settings."
                onBack={onBack}
                continueButtonText="Complete"
            >
                <RadioCustom
                    name="overhead"
                    options={options}
                    selectedValue={selectedOption}
                    onChange={handleOptionChange}
                    customInput={
                        <label className="flex items-center gap-2 cursor-pointer w-full h-full">
                            <input
                                type="radio"
                                name="overhead"
                                checked={selectedOption === CUSTOM_INPUT_VALUE}
                                onChange={() =>
                                    setSelectedOption(CUSTOM_INPUT_VALUE)
                                }
                                className="cursor-pointer flex-shrink-0"
                            />
                            <input
                                type="number"
                                value={customValue || ""}
                                onChange={(e) =>
                                    handleCustomChange(e.target.value)
                                }
                                placeholder="Type custom percentage %"
                                className="flex-1 outline-none bg-transparent h-full"
                                onClick={() =>
                                    setSelectedOption(CUSTOM_INPUT_VALUE)
                                }
                            />
                        </label>
                    }
                    error={formErrors.overheadCostPercentage}
                />
            </SetupLayout>
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
        </>
    );
}
