import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type RadioCustomOptions = {
    value: string;
    label: string;
};

type RadioCustomProps = BaseInputProps & {
    name: string;
    options: RadioCustomOptions[];
    selectedValue: string | null;
    onChange: (value: string) => void;
    error?: string;
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
    customInput,
}: RadioCustomProps) => {
    return (
        <div className="flex flex-col gap-2">
            <FormLabel label={label} required={required} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] justify-items-center sm:w-[610px] mx-auto">
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
            {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
            )}
        </div>
    );
};

export default RadioCustom;
