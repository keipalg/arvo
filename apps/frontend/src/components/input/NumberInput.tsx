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
    onChange,
    onBlur,
}: NumberInputProps) => {
    return (
        <div className="flex flex-col gap-1">
            <FormLabel label={label} required={required} />
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
                className="border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default NumberInput;
