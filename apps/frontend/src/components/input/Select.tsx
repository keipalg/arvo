type Option = {
    value: string;
    label: string;
};

type SelectProps = {
    name?: string;
    label?: string;
    value: string;
    options?: Option[];
    optgroup?: {
        optGroupLabel: string;
        optGroupValues: Option[];
    }[];
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Select = ({
    label,
    name,
    value,
    options,
    optgroup,
    onChange,
    error,
}: SelectProps) => {
    return (
        <div className="flex flex-col">
            <label className="font-semibold">{label}</label>
            <select
                className="border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5"
                name={name}
                value={value}
                onChange={onChange}
            >
                {options
                    ? options.map((option, index) => (
                          <>
                              <option
                                  value={option.value}
                                  disabled={index === 0 && option.value === ""}
                              >
                                  {option.label}
                              </option>
                          </>
                      ))
                    : optgroup?.map((group) => (
                          <>
                              <optgroup label={group.optGroupLabel}>
                                  {group.optGroupValues.map((option) => (
                                      <option
                                          key={option.value}
                                          value={option.value}
                                          data-expensecategory={
                                              group.optGroupLabel
                                          }
                                      >
                                          {option.label}
                                      </option>
                                  ))}
                              </optgroup>
                          </>
                      ))}
            </select>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};

export default Select;
