import { useEffect, useRef, useState } from "react";

type TableFilterValueOption = {
    key: string;
    label: string;
};

type TableFilterOption = {
    key: string;
    label: string;
    values: TableFilterValueOption[];
};

type TableFilterProps = {
    options: TableFilterOption[];
    onSelect?: (option: TableFilterValueOption) => void;
};

const TableFilter = ({ options, onSelect }: TableFilterProps) => {
    const filterRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedOption, setSelectedOption] =
        useState<TableFilterValueOption | null>(null);

    const handleSelectValue = (value: TableFilterValueOption) => {
        onSelect?.(value);
        setSelectedOption(value);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block z-20" ref={filterRef}>
            <button
                type="button"
                className={`border border-arvo-black-5 my-2 px-2 py-1 rounded-md cursor-pointer flex gap-1.5 ${open && "bg-arvo-blue-50"}`}
                onClick={() => setOpen(!open)}
            >
                <img src="/icon/table-filter.svg"></img>
                <span className="text-arvo-black-100">
                    {`Filter${selectedOption ? ": " + selectedOption.label : ""}`}
                </span>
            </button>
            {open && (
                <div className="absolute bg-arvo-white-0 rounded overflow-clip z-10 shadow-md">
                    {options.map((option) => (
                        <div key={option.key}>
                            <div className="px-4 py-2 hover:bg-arvo-blue-50 cursor-pointer whitespace-nowrap">
                                {option.label}
                            </div>

                            {option.values &&
                                option.values.length > 0 &&
                                option.values.map((value) => (
                                    <div
                                        key={`${option.key}:${value.key}`}
                                        onClick={() => handleSelectValue(value)}
                                        className="ml-4 px-4 py-2 hover:bg-arvo-blue-50 cursor-pointer whitespace-nowrap"
                                    >
                                        {value.label}
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TableFilter;
