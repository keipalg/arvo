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
            <div className="flex flex-row border rounded-xl items-center bg-arvo-white-0 border-arvo-black-5 has-disabled:bg-arvo-black-5 focus-within:outline-2 focus-within:outline-arvo-blue-100">
                {unit && (
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
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    step={step}
                    min={min}
                    max={max}
                    disabled={disabled}
                    required={required}
                    className="px-2.5 py-2.5 grow disabled:cursor-not-allowed outline-none"
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default NumberInput;
