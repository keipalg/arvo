import {
    userPreferenceHandcraftTypesValidation,
    type UserPreferencesValidationForm,
} from "@arvo/shared";
import { useState } from "react";
import CheckboxCustom from "../input/CheckboxCustom";
import SetupLayout from "./SetupLayout";

type SetupStepHandcraftTypesProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext: () => void;
};

// Note: For now, only "Pottery & Ceramics" is available.
// Other handcraft types will be available in future app updates.
const DEFAULT_HANDCRAFT_TYPE = "Pottery & Ceramics";

export function SetupStepHandcraftTypes({
    data,
    onUpdate,
    onNext,
}: SetupStepHandcraftTypesProps) {
    const defaultOptions = [
        { value: "Art Prints", label: "Art Prints" },
        { value: "Beauty & Wellness", label: "Beauty & Wellness" },
        { value: "Fashion & Apparel", label: "Fashion & Apparel" },
        { value: "Fiber Arts", label: "Fiber Arts" },
        { value: "Home Decor", label: "Home Decor" },
        { value: "Paper & Stationery", label: "Paper & Stationery" },
        { value: "Jewelry & Accessories", label: "Jewelry & Accessories" },
        { value: "Pottery & Ceramics", label: "Pottery & Ceramics" },
    ];

    const [options, setOptions] = useState(defaultOptions);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedOptions, setSelectedOptions] = useState<string[]>([
        DEFAULT_HANDCRAFT_TYPE,
    ]);

    const handleAddCustomHandcraft = (value: string) => {
        // Add the new handcraft type to the options list
        setOptions((prev) => [...prev, { value, label: value }]);

        // Add the new custom value to selectedOptions and select it
        setSelectedOptions((prev) => {
            const updatedOptions = [...prev, value];
            onUpdate({ ...data, handcraftTypes: updatedOptions });
            return updatedOptions;
        });
    };

    const handleSelectedOptionsChange = (value: string) => {
        setSelectedOptions((prev) => {
            const updatedOptions = prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value];

            onUpdate({ ...data, handcraftTypes: updatedOptions });
            return updatedOptions;
        });
        setFormErrors({});
    };

    const handleSaveAndContinue = () => {
        if (selectedOptions.length === 0) {
            setFormErrors({
                handcraftTypes: "Please select at least one handcraft type.",
            });
            return;
        }

        const invalidSelections = selectedOptions.filter(
            (option) => option !== DEFAULT_HANDCRAFT_TYPE,
        );

        if (invalidSelections.length > 0) {
            const invalidTypes = invalidSelections.join(", ");
            setFormErrors({
                handcraftTypes: `${invalidTypes} ${invalidSelections.length > 1 ? "are" : "is"} not yet available. Tune in to the next app update!`,
            });
            return;
        }

        const result = userPreferenceHandcraftTypesValidation.safeParse({
            handcraftTypes: selectedOptions,
        });

        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                if (issue.path.length > 0) {
                    errors[issue.path[0] as string] = issue.message;
                }
            });
            setFormErrors(errors);
            return;
        }

        onNext();
    };

    return (
        <SetupLayout
            title="Hello creator! What kind of products do you sell?"
            subtitle="Select up to 3."
            onContinue={handleSaveAndContinue}
        >
            <CheckboxCustom
                name="handcraftTypes"
                options={options}
                selectedValues={selectedOptions}
                onChange={handleSelectedOptionsChange}
                error={formErrors.handcraftTypes}
                onAddCustom={handleAddCustomHandcraft}
                placeholder="Type custom handcraft category..."
                maxSelections={3}
            />
        </SetupLayout>
    );
}
