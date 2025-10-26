import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type RadioOption = {
    value: string;
    label: string;
};

type RadioInputProps = BaseInputProps & {
    name: string;
    options: RadioOption[];
    selectedValue: string | null;
    onChange: (value: string) => void;
    error?: string;
    columns?: number;
    customInput?: React.ReactNode;
};

const CUSTOM_INPUT_VALUE = "custom";

const RadioCustom = ({
    name,
    label,
    options,
    selectedValue,
    onChange,
    error,
    required,
    columns = 1,
    customInput,
}: RadioInputProps) => {
    const getGridColumnClass = () => {
        switch (columns) {
            case 2:
                return "md:grid-cols-2";
            case 3:
                return "md:grid-cols-3";
            default:
                return "md:grid-cols-1";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <FormLabel label={label} required={required} />
            <div
                className={`grid grid-cols-1 ${getGridColumnClass()} gap-[10px]`}
            >
                {options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                        <label
                            key={option.value}
                            className={`flex items-center gap-2 cursor-pointer w-[300px] h-[60px] px-[15px] py-[12px] rounded-[16px] transition-all ${
                                isSelected
                                    ? "border-2 border-arvo-blue-100"
                                    : "border border-arvo-black-5"
                            }`}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={isSelected}
                                onChange={() => onChange(option.value)}
                                className="cursor-pointer"
                            />
                            <span>{option.label}</span>
                        </label>
                    );
                })}
                {customInput && (
                    <div
                        className={`w-[300px] h-[60px] px-[15px] py-[12px] rounded-[16px] transition-all ${
                            selectedValue === CUSTOM_INPUT_VALUE
                                ? "border-2 border-arvo-blue-100"
                                : "border border-arvo-black-5"
                        }`}
                    >
                        {customInput}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default RadioCustom;
