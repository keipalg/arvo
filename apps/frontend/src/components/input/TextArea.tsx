import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type TextAreaProps = BaseInputProps & {
    name?: string;
    placeholder?: string;
    value: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const TextArea = ({
    name,
    placeholder,
    label,
    value,
    error,
    onChange,
}: TextAreaProps) => {
    return (
        <div className="flex flex-col">
            <FormLabel label={label} />
            <textarea
                name={name}
                placeholder={placeholder}
                className="border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5"
                value={value}
                onChange={onChange}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default TextArea;
