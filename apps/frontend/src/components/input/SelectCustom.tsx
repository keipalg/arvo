import { useEffect, useRef, useState, type ReactNode } from "react";
import FormLabel from "./FormLabel";
import type { BaseInputProps } from "./BaseInputProps";

type Option<T> = {
    value: T;
    label?: string;
    render?: ReactNode;
};

type SelectCustomProps<T> = BaseInputProps & {
    name?: string;
    value: T;
    options: Option<T>[];
    error?: string;
    onChange: (value: T) => void;
};

const SelectCustom = <T extends string | number>({
    options,
    value,
    name,
    label,
    onChange,
    error,
}: SelectCustomProps<T>) => {
    const [open, setOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div>
            <FormLabel label={label} />
            <div ref={selectRef} className="relative ">
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="select-list"
                    onClick={() => setOpen(!open)}
                    className="border rounded-xl focus:outline-2 outline-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5
                        w-full flex"
                >
                    {selectedOption?.render ?? (
                        <span>button {selectedOption?.label}</span>
                    )}
                </button>
                {open && (
                    <div className="absolute mt-1.5 z-10 bg-arvo-white-0 w-full rounded-xl outline-arvo-blue-100 outline-2 overflow-clip">
                        {options.map((option) => (
                            <div
                                key={String(option.value)}
                                role="option"
                                aria-selected={option.value === value}
                                data-value={String(option.value)}
                                className={`w-full p-2 hover:bg-arvo-blue-80 ${option.value === value ? "bg-arvo-blue-20" : ""}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                            >
                                {option.render ?? option.label}
                            </div>
                        ))}
                    </div>
                )}
                {name && <input type="hidden" name={name} value={value} />}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
};
export default SelectCustom;
