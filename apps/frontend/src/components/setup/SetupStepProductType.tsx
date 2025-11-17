import { useState, useEffect } from "react";
import {
    userPreferenceProductTypesValidation,
    type UserPreferencesValidationForm,
} from "@arvo/shared";
import CheckboxCustom from "../input/CheckboxCustom";
import SetupLayout from "./SetupLayout";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";

type SetupStepProductTypesProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext: () => void;
    onBack?: () => void;
};

export function SetupStepProductTypes({
    data,
    onUpdate,
    onNext,
    onBack,
}: SetupStepProductTypesProps) {
    const defaultOptions = [
        { value: "Bowls", label: "Bowls" },
        { value: "Cups", label: "Cups" },
        { value: "Coaster", label: "Coaster" },
        { value: "Dinner Plates", label: "Dinner Plates" },
        { value: "Plates", label: "Plates" },
        { value: "Planter", label: "Planter" },
        { value: "Vases", label: "Vases" },
        { value: "Soap Dishes", label: "Soap Dishes" },
        { value: "Tea Pots", label: "Tea Pots" },
        { value: "Sculptural", label: "Sculptural" },
    ];

    const [options, setOptions] = useState(() => {
        const savedProducts = data.productTypes || [];

        // Find custom products (ones not in default options)
        const defaultValues = defaultOptions.map((opt) => opt.value);
        const customProducts = savedProducts
            .filter((product) => !defaultValues.includes(product))
            .map((product) => ({ value: product, label: product }));

        // Combine default options with custom products
        return [...defaultOptions, ...customProducts];
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
        data.productTypes || [],
    );

    // Update parent component when selectedOptions changes
    useEffect(() => {
        onUpdate({ ...data, productTypes: selectedOptions });
    }, [selectedOptions]);

    const handleAddCustomProduct = (value: string) => {
        // Add the new product to the options list
        setOptions((prev) => [...prev, { value, label: value }]);

        // Add the new custom value to selectedOptions and select it
        setSelectedOptions((prev) => [...prev, value]);
    };

    const updateProductTypesMutation = useMutation(
        trpc.productTypes.addBulk.mutationOptions({
            onSuccess: () => {
                onNext();
            },
        }),
    );

    const handleSelectedOptionsChange = (value: string) => {
        setSelectedOptions((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        );
        setFormErrors({});
    };

    const handleSaveAndContinue = () => {
        const result = userPreferenceProductTypesValidation.safeParse({
            productTypes: selectedOptions,
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

        updateProductTypesMutation.mutate({ productTypes: selectedOptions });
    };

    return (
        <SetupLayout
            title="To help us set up your workspace, what type of pottery / ceramic products do you make?"
            subtitle="We’ll set up your products page based on your choices. Select as many as you want."
            onContinue={handleSaveAndContinue}
            caption="You can always change this later in Settings."
            onBack={onBack}
        >
            <CheckboxCustom
                name="productTypes"
                options={options}
                selectedValues={selectedOptions}
                onChange={handleSelectedOptionsChange}
                error={formErrors.productTypes}
                onAddCustom={handleAddCustomProduct}
                placeholder="Type custom product..."
            />
        </SetupLayout>
    );
}
