import { useState, useEffect } from "react";
import {
    userPreferenceMaterialTypesValidation,
    type UserPreferencesValidationForm,
} from "@arvo/shared";
import CheckboxCustom from "../input/CheckboxCustom";
import SetupLayout from "./SetupLayout";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";
import { useDevAutofill } from "../../hooks/useDevAutofill";
import { demoData } from "../../config/demoData";

type SetupStepMaterialTypesProps = {
    data: UserPreferencesValidationForm;
    onUpdate: (data: UserPreferencesValidationForm) => void;
    onNext: () => void;
    onBack?: () => void;
};

export function SetupStepMaterialTypes({
    data,
    onUpdate,
    onNext,
    onBack,
}: SetupStepMaterialTypesProps) {
    const defaultOptions = [
        { value: "Buff Clay", label: "Buff Clay" },
        { value: "Stoneware Clay", label: "Stoneware Clay" },
        { value: "Porcelain Clay", label: "Porcelain Clay" },
        { value: "Earthenware Clay", label: "Earthenware Clay" },
        { value: "Glossy Glaze", label: "Glossy Glaze" },
        { value: "Satin Glaze", label: "Satin Glaze" },
        { value: "Matte Glaze", label: "Matte Glaze" },
        { value: "Clear Glaze", label: "Clear Glaze" },
        { value: "Underglaze", label: "Underglaze" },
        { value: "Stain", label: "Stain" },
    ];

    const [options, setOptions] = useState(() => {
        const savedMaterials = data.materialTypes || [];

        // Find custom materials (ones not in default options)
        const defaultValues = defaultOptions.map((opt) => opt.value);
        const customMaterials = savedMaterials
            .filter((material) => !defaultValues.includes(material))
            .map((material) => ({ value: material, label: material }));

        // Combine default options with custom materials
        return [...defaultOptions, ...customMaterials];
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
        data.materialTypes || [],
    );

    useDevAutofill(() => {
        setSelectedOptions(demoData.materialTypes.materialTypes || []);
        setFormErrors({});
    }, []);

    // Update parent component when selectedOptions changes
    useEffect(() => {
        onUpdate({ ...data, materialTypes: selectedOptions });
    }, [selectedOptions]);

    const handleAddCustomMaterial = (value: string) => {
        // Add the new material to the options list
        setOptions((prev) => [...prev, { value, label: value }]);

        // Add the new custom value to selectedOptions and select it
        setSelectedOptions((prev) => [...prev, value]);
    };

    const updateMaterialTypesMutation = useMutation(
        trpc.materialTypes.addBulk.mutationOptions({
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
        const result = userPreferenceMaterialTypesValidation.safeParse({
            materialTypes: selectedOptions,
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

        updateMaterialTypesMutation.mutate({ materialTypes: selectedOptions });
    };

    return (
        <SetupLayout
            title="What materials do you work the most with?"
            subtitle="This helps you stay organized later when tracking inventory"
            onContinue={handleSaveAndContinue}
            caption="You can always change this later in Settings."
            onBack={onBack}
        >
            <CheckboxCustom
                name="materialTypes"
                options={options}
                selectedValues={selectedOptions}
                onChange={handleSelectedOptionsChange}
                error={formErrors.materialTypes}
                onAddCustom={handleAddCustomMaterial}
                placeholder="Type custom material..."
            />
        </SetupLayout>
    );
}
