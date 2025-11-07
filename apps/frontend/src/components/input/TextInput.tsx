import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type TextInputProps = BaseInputProps & {
    type?: string;
    name?: string;
    placeholder?: string;
    value: string | number;
    error?: string;
    step?: string;
    required?: boolean;
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
    required,
    onChange,
}: TextInputProps) => {
    return (
        <div className="flex flex-col pb-2">
            <FormLabel label={label} required={required} />
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                step={step}
                className="border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default TextInput;
