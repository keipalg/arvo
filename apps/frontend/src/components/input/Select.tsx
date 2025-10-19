type Option = {
    value: string;
    label: string;
};

type SelectProps = {
    name?: string;
    label?: string;
    value: string;
    options: Option[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Select = ({ label, name, value, options, onChange }: SelectProps) => {
    return (
        <div className="flex flex-col gap-1">
            <label>{label}</label>
            <select
                className="border rounded px-2 py-1 bg-white"
                name={name}
                value={value}
                onChange={onChange}
            >
                {options.map((option, index) => (
                    <>
                        <option
                            value={option.value}
                            disabled={index === 0 && option.value === ""}
                        >
                            {option.label}
                        </option>
                    </>
                ))}
            </select>
        </div>
    );
};

export default Select;
