type TextAreaProps = {
    name?: string;
    placeholder?: string;
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const TextArea = ({
    name,
    placeholder,
    label,
    value,
    onChange,
}: TextAreaProps) => {
    return (
        <div className="flex flex-col gap-1">
            <label>{label}</label>
            <textarea
                name={name}
                placeholder={placeholder}
                className="border rounded px-2 py-1 bg-white"
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default TextArea;
