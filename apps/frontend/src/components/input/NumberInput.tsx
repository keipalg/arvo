type NumberInputProps = {
    name?: string;
    placeholder?: string;
    label?: string;
    value: number;
    error?: string;
    step?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const NumberInput = ({
    name,
    placeholder,
    label,
    value,
    error,
    step,
    min,
    max,
    disabled,
    onChange,
}: NumberInputProps) => {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="font-semibold">{label}</label>}
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
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
