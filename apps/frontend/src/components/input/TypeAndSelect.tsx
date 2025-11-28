import { useState, useEffect, useRef, useMemo } from "react";
import FormLabel from "./FormLabel";
import type { BaseInputProps } from "./BaseInputProps";

export type TypeAndSelectOption = {
    value: string;
    label: string;
    category?: string;
};

export type TypeAndSelectGroup = {
    label: string;
    options: TypeAndSelectOption[];
};

type TypeAndSelectProps = BaseInputProps & {
    options?: TypeAndSelectOption[];
    groups?: TypeAndSelectGroup[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
};

const TypeAndSelect = ({
    label,
    options,
    groups,
    value,
    onChange,
    required,
    error,
    placeholder = "Select or type...",
}: TypeAndSelectProps) => {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    const allOptions: TypeAndSelectOption[] = useMemo(
        () => groups?.flatMap((group) => group.options) ?? options ?? [],
        [groups, options],
    );

    const selectedOption = allOptions.find((option) => option.value === value);

    const filteredOptions = allOptions.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );

    const filteredGroups = groups
        ? groups
              .map((group) => ({
                  label: group.label,
                  options: group.options.filter((option) =>
                      option.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()),
                  ),
              }))
              .filter((group) => group.options.length > 0)
        : null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (value && selectedOption && newValue !== selectedOption.label) {
            onChange("");
        }
    };

    const handleSelect = (optionValue: string) => {
        const selectedItem = allOptions.find(
            (option) => option.value === optionValue,
        );
        onChange(optionValue);
        setInputValue(selectedItem?.label || "");
        setIsOpen(false);
    };

    useEffect(() => {
        if (inputValue && !value && isOpen) {
            const matchingOption = allOptions.find(
                (option) =>
                    option.label.toLowerCase() === inputValue.toLowerCase(),
            );
            if (matchingOption) {
                onChange(matchingOption.value);
            }
        }
    }, [allOptions, inputValue, value, onChange, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectorRef.current &&
                !selectorRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                if (!value) {
                    setInputValue("");
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    useEffect(() => {
        if (!isOpen && selectedOption && !inputValue) {
            setInputValue(selectedOption.label);
        }
    }, [selectedOption, isOpen, inputValue]);

    useEffect(() => {
        if (!isOpen) {
            if (!value) {
                setInputValue("");
            } else if (selectedOption) {
                setInputValue(selectedOption.label);
            }
        }
    }, [value, selectedOption, isOpen]);

    return (
        <div>
            <FormLabel label={label} required={required} />
            <div ref={selectorRef} className="relative">
                <input
                    type="text"
                    value={
                        isOpen
                            ? inputValue
                            : inputValue || selectedOption?.label || ""
                    }
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsOpen(true);
                        if (
                            selectedOption &&
                            inputValue === selectedOption.label
                        ) {
                            setInputValue("");
                        }
                    }}
                    placeholder={placeholder}
                    className="border rounded-xl focus:outline-2 outline-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 w-full pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <img
                        src="/icon/alt-arrow-down.svg"
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>

                {isOpen && (
                    <div className="absolute mt-1.5 z-10 bg-arvo-white-0 w-full rounded-xl outline-arvo-blue-100 outline-2 overflow-clip max-h-60 overflow-y-auto">
                        {filteredGroups ? (
                            // Render grouped options
                            <>
                                {filteredGroups.map((group) => (
                                    <div key={group.label}>
                                        <div className="px-2.5 py-1.5 font-semibold text-arvo-black-50">
                                            {group.label}
                                        </div>
                                        {group.options.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    handleSelect(option.value)
                                                }
                                                className={`w-full pl-8 p-2.5 text-left cursor-pointer transition-colors ${
                                                    option.value === value
                                                        ? "bg-arvo-blue-20"
                                                        : "hover:bg-arvo-blue-50"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                                {filteredGroups.length === 0 && (
                                    <div className="p-2.5 text-gray-500">
                                        No options found
                                    </div>
                                )}
                            </>
                        ) : (
                            // Render flat options
                            <>
                                {filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(option.value)
                                        }
                                        className={`w-full p-2.5 text-left cursor-pointer transition-colors ${
                                            option.value === value
                                                ? "bg-arvo-blue-20"
                                                : "hover:bg-arvo-blue-20"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                {filteredOptions.length === 0 && (
                                    <div className="p-2.5 text-gray-500">
                                        No options found
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
    );
};

export default TypeAndSelect;
