import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type WeightWithUnit = BaseInputProps & {
    name?: string;
    placeholder?: string;
    value: number;
    error?: string;
    step?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    unit?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

const WeightWithUnit = ({
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
}: WeightWithUnit) => {
    return (
        <div className="flex flex-col pb-2">
            <FormLabel label={label} required={required} />
            <div
                className={`relative flex flex-row border rounded-xl items-center border-arvo-black-5 focus-within:outline-2 focus-within:outline-arvo-blue-100 ${!disabled ? "bg-arvo-white-0" : "bg-arvo-blue-20 border-0"}`}
            >
                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    step={step}
                    min={min}
                    max={max}
                    disabled={disabled}
                    required // Enforce non-empty input
                    className="px-2.5 py-2.5 grow outline-none disabled:py-0.5 disabled:px-0"
                />
                {unit && (
                    <span
                        className={`absolute  text-base  font-normal text-center ${!disabled ? "border-arvo-black-10 border-l text-arvo-black-10 w-8 right-11" : "border-0 left-10"}`}
                    >
                        {unit}
                    </span>
                )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default WeightWithUnit;
