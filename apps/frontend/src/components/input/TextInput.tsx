type TextInputProps = {
    type?: string;
    name?: string;
    placeholder?: string;
    label?: string;
    value: string | number;
    error?: string;
    step?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TextInput = ({
    type = "text",
    name,
    placeholder,
    label,
    value,
    error,
    step,
    onChange,
}: TextInputProps) => {
    return (
        <div className="flex flex-col gap-1">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                step={step}
                className="border rounded px-2 py-1 bg-white"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default TextInput;
