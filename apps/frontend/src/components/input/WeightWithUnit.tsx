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
        <div className="flex flex-col gap-1 pb-2">
            <FormLabel label={label} required={required} />
            <div className="relative flex flex-row border rounded-xl items-center bg-arvo-white-0 border-arvo-black-5 has-disabled:bg-arvo-black-5 focus-within:outline-2 focus-within:outline-arvo-blue-100">
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
                    className="px-2.5 py-2.5 grow disabled:cursor-not-allowed outline-none"
                />
                {unit && (
                    <span className="absolute w-8 text-base right-11 font-normal  text-center text-arvo-black-10 border-l border-arvo-black-10">
                        {unit}
                    </span>
                )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default WeightWithUnit;
