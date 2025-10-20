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
        <div className="flex flex-col">
            <label className="font-semibold">{label}</label>
            <select
                className="border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5"
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
