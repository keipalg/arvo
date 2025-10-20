type NumberInputProps = {
    name?: string;
    placeholder?: string;
    label?: string;
    value: number;
    error?: string;
    step?: string;
    min?: string;
    max?: string;
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
    onChange,
}: NumberInputProps) => {
    return (
        <div className="flex flex-col gap-1">
            {label && <label>{label}</label>}
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                step={step}
                min={min}
                max={max}
                required // Enforce non-empty input
                className="border rounded px-2 py-1 bg-white"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default NumberInput;
