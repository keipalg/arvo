import { useEffect, useRef } from "react";
import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type NumberInputProps = BaseInputProps & {
    name?: string;
    placeholder?: string;
    value: number;
    error?: string;
    step?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    unit?: string;
    unitPosition?: "left" | "right";
    style?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

const NumberInput = ({
    name,
    placeholder,
    required,
    label,
    value,
    error,
    step,
    min,
    max,
    disabled,
    unit,
    unitPosition = "left",
    onChange,
    onBlur,
    style,
}: NumberInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Update input value when prop changes (only when not actively typing)
    useEffect(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.value = value.toString();
        }
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Clear the input if it's 0 to make it easier to type a new value
        if (e.target.value === "0") {
            e.target.value = "";
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let numValue = parseFloat(inputValue);

        // Check empty or invalid, set to minimum or 0
        if (inputValue === "" || isNaN(numValue)) {
            numValue = min ? parseFloat(min) : 0;
        } else {
            // Set to minimum provided if input is less than minimum
            if (min !== undefined && numValue < parseFloat(min)) {
                numValue = parseFloat(min);
            }
            // Set to maximum provided if input is less than maximum
            if (max !== undefined && numValue > parseFloat(max)) {
                numValue = parseFloat(max);
            }
        }

        // Update input display with corrected value
        if (inputRef.current) {
            inputRef.current.value = numValue.toString();
        }

        // Create new copy of event, then replace target to put the desired value
        const correctedEvent = {
            ...e,
            target: {
                ...e.target,
                value: numValue.toString(),
            },
        } as React.FocusEvent<HTMLInputElement>;

        // Call the original onChange with corrected value
        onChange(
            correctedEvent as unknown as React.ChangeEvent<HTMLInputElement>,
        );

        // Call original onBlur if provided
        if (onBlur) {
            onBlur(correctedEvent);
        }
    };

    return (
        <div className={`flex flex-col gap-1 pb-2 ${style ? style : ""}`}>
            <FormLabel label={label} required={required} />
            <div
                className={`${unitPosition === "right" ? "relative" : ""} flex flex-row border rounded-xl items-center ${!disabled ? "bg-arvo-white-0" : unitPosition === "right" ? "bg-arvo-blue-20 border-0" : "bg-arvo-black-5"} border-arvo-black-5 ${unitPosition === "right" ? "" : "has-disabled:bg-arvo-black-5"} focus-within:outline-2 focus-within:outline-arvo-blue-100`}
            >
                {unit && unitPosition === "left" && (
                    <span className="w-8 font-semibold text-center px-2.5 my-2.5 text-gray-600 border-r border-arvo-black-10">
                        {unit}
                    </span>
                )}
                <input
                    ref={inputRef}
                    type="number"
                    name={name}
                    defaultValue={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    step={step}
                    min={min}
                    max={max}
                    disabled={disabled}
                    required={required}
                    className={`${unitPosition === "right" ? "disabled:py-0.5 disabled:px-0" : "disabled:cursor-not-allowed"} px-2.5 py-2.5 grow outline-none`}
                />
                {unit && unitPosition === "right" && (
                    <span
                        className={`absolute text-base font-normal text-center ${!disabled ? "border-arvo-black-10 border-l text-arvo-black-10 w-8 right-11" : "border-0 left-10"}`}
                    >
                        {unit}
                    </span>
                )}
            </div>
            {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
            )}
        </div>
    );
};

export default NumberInput;
