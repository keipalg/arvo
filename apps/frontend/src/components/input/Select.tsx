import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type Option = {
    value: string;
    label: string;
    style?: string;
};

type SelectProps = BaseInputProps & {
    name?: string;
    value: string;
    style?: string;
    options?: Option[];
    optgroup?: {
        optGroupLabel: string;
        optGroupValues: Option[];
    }[];
    disabled?: boolean;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Select = ({
    label,
    name,
    value,
    options,
    optgroup,
    disabled,
    onChange,
    error,
    style,
    required,
}: SelectProps) => {
    const getSelectedLabel = () => {
        if (options) {
            const selected = options.find((opt) => opt.value === value);
            return selected?.label || "";
        }
        if (optgroup) {
            for (const group of optgroup) {
                const selected = group.optGroupValues.find(
                    (opt) => opt.value === value,
                );
                if (selected) return selected.label;
            }
        }
        return "";
    };

    const selectedLabel = getSelectedLabel();

    // Automatically determine arrow position based on whether there's a label
    const defaultArrowPosition = label ? "top-[62%]" : "top-1/3";
    const arrowPosition = style ? style : defaultArrowPosition;

    return (
        <div className="relative flex flex-col pb-2 w-full">
            <FormLabel label={label} required={required} />
            <select
                className={`w-full border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 pr-10 outline-none appearance-none disabled:border-0 disabled:py-0.5  disabled:bg-arvo-blue-20 ... truncate`}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                title={selectedLabel}
            >
                {options
                    ? options.map((option, index) => (
                          <option
                              title={option.label}
                              key={option.value}
                              value={option.value}
                              disabled={index === 0 && option.value === ""}
                          >
                              {option.label}
                          </option>
                      ))
                    : optgroup?.map((group) => (
                          <optgroup
                              label={group.optGroupLabel}
                              key={group.optGroupLabel}
                          >
                              {group.optGroupValues.map((option) => (
                                  <option
                                      key={option.value}
                                      value={option.value}
                                      data-expensecategory={group.optGroupLabel}
                                  >
                                      {option.label}
                                  </option>
                              ))}
                          </optgroup>
                      ))}
            </select>
            <div
                className={`absolute right-3 ${arrowPosition} pointer-events-none bg-arvo-white-0`}
            >
                {!disabled && (
                    <img src="/icon/alt-arrow-down.svg " className="w-4 h-4" />
                )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default Select;
