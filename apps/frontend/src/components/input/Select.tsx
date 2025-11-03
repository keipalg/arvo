import type { BaseInputProps } from "./BaseInputProps";
import FormLabel from "./FormLabel";

type Option = {
    value: string;
    label: string;
};

type SelectProps = BaseInputProps & {
    name?: string;
    value: string;
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
}: SelectProps) => {
    return (
        <div className="flex flex-col">
            <FormLabel label={label} />
            <select
                className={`border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 disabled:bg-arvo-black-5 disabled:cursor-not-allowed outline-none`}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                {options
                    ? options.map((option, index) => (
                          <option
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
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default Select;
