import { useState } from "react";
import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type CheckboxOption = {
    value: string;
    label: string;
};

type CheckboxCustomProps = BaseInputProps & {
    name: string;
    options: CheckboxOption[];
    selectedValues: string[];
    onChange: (value: string) => void;
    onAddCustom: (value: string) => void;
    error?: string;
};

const CheckboxCustom = ({
    name,
    label,
    options,
    selectedValues,
    onChange,
    onAddCustom,
    error,
    required,
}: CheckboxCustomProps) => {
    const [customInputValue, setCustomInputValue] = useState("");
    const handleCustomInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ): void => {
        if (e.key === "Enter" && customInputValue.trim()) {
            e.preventDefault();
            onAddCustom(customInputValue.trim());
            setCustomInputValue("");
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <FormLabel label={label} required={required} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px] justify-items-center sm:w-[610px] lg:w-[920px] mx-auto">
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                        <label
                            key={option.value}
                            className={`flex items-center gap-2 cursor-pointer w-[300px] h-[60px] px-[15px] py-[12px] rounded-[16px] transition-all ${
                                isSelected
                                    ? "border-2 border-arvo-blue-100"
                                    : "border border-arvo-black-5"
                            }`}
                        >
                            <input
                                type="checkbox"
                                name={name}
                                value={option.value}
                                checked={isSelected}
                                onChange={() => onChange(option.value)}
                                className="cursor-pointer"
                            />
                            <span>{option.label}</span>
                        </label>
                    );
                })}
                <div className="w-[300px] h-[60px] px-[15px] py-[12px] rounded-[16px] transition-all border border-arvo-black-5">
                    <input
                        type="text"
                        value={customInputValue}
                        onChange={(e) => setCustomInputValue(e.target.value)}
                        onKeyDown={handleCustomInputKeyDown}
                        placeholder="Type and press Enter"
                        className="w-full h-full outline-none bg-transparent"
                    />
                </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default CheckboxCustom;
