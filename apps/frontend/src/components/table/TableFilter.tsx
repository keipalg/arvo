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
    onSelect?: (option: TableFilterValueOption | null) => void;
};

const TableFilter = ({ options, onSelect }: TableFilterProps) => {
    const filterRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedOption, setSelectedOption] =
        useState<TableFilterValueOption | null>(null);

    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        setExpandedGroups((prev) => {
            const next: Record<string, boolean> = {};
            options.forEach((opt) => {
                next[opt.key] = prev[opt.key] ?? false;
            });
            return next;
        });
    }, [options]);

    const toggleGroup = (key: string) => {
        setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectValue = (value: TableFilterValueOption) => {
        onSelect?.(value);
        setSelectedOption(value);
        setOpen(false);
    };

    const clearSelecton = () => {
        onSelect?.(null);
        setSelectedOption(null);
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
                className={`border border-arvo-black-5 my-2 px-2 py-1 rounded-md cursor-pointer flex gap-1.5 ${open && "bg-arvo-blue-100 border-arvo-blue-100"}`}
                onClick={() => setOpen(!open)}
            >
                <img
                    src={`${open ? "/icon/table-filter-selected.svg" : "/icon/table-filter.svg"}`}
                ></img>
                <span
                    className={`${open ? "text-arvo-white-100" : "text-arvo-black-100"}`}
                >
                    {`Filter${selectedOption ? ": " + selectedOption.label : ""}`}
                </span>
            </button>
            {open && (
                <div className="absolute bg-arvo-white-0 rounded-xl overflow-clip z-10 shadow-md/30 min-w-64">
                    <div
                        onClick={() => clearSelecton()}
                        className="flex justify-between items-center px-4 py-1 pt-3 hover:bg-arvo-blue-50 cursor-pointer whitespace-nowrap"
                    >
                        <span>Clear</span>
                        <img
                            src="/icon/table-filter-dark.svg"
                            className="pl-1 w-5"
                        />
                    </div>
                    {options.map((option, index) => (
                        <div key={option.key}>
                            {/* Group header is now clickable to collapse/expand */}
                            <div
                                role="button"
                                aria-expanded={!!expandedGroups[option.key]}
                                onClick={() => toggleGroup(option.key)}
                                className={`flex items-center justify-between px-4 py-1 hover:bg-arvo-blue-50 cursor-pointer whitespace-nowrap ${index === options.length - 1 && !expandedGroups[option.key] ? "pb-3" : ""}`}
                            >
                                <div>{option.label}</div>
                                <img
                                    src={
                                        expandedGroups[option.key]
                                            ? "/icon/arrow-alt-down.svg"
                                            : "/icon/arrow-alt-right.svg"
                                    }
                                    alt={
                                        expandedGroups[option.key]
                                            ? "Collapse"
                                            : "Expand"
                                    }
                                    className="w-4 h-4"
                                />
                            </div>

                            {option.values &&
                                option.values.length > 0 &&
                                expandedGroups[option.key] &&
                                option.values.map((value, valueIndex) => (
                                    <div
                                        key={`${option.key}:${value.key}`}
                                        onClick={() => handleSelectValue(value)}
                                        className={`pl-8 px-4 py-1 hover:bg-arvo-blue-50 cursor-pointer whitespace-nowrap 
                                            ${index === options.length - 1 && valueIndex === option.values.length - 1 ? "pb-3" : ""}`}
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
