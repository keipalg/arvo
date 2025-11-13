import { useEffect, useRef, useState } from "react";

type TableSortOption = {
    key: string;
    label: string;
    order?: "asc" | "desc";
};

type TableSortProps = {
    options: TableSortOption[];
    onSelect?: (option: TableSortOption) => void;
};

const TableSort = ({ options, onSelect }: TableSortProps) => {
    const [open, setOpen] = useState(false);
    const [selectedOption, setSelectedOption] =
        useState<TableSortOption | null>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    const handleSelect = (option: TableSortOption) => {
        onSelect?.(option);
        setSelectedOption(option);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sortRef.current &&
                !sortRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block z-20" ref={sortRef}>
            <button
                type="button"
                className={`border border-arvo-black-5 my-2 px-2 py-1 rounded-md cursor-pointer flex gap-1.5 ${open && "bg-arvo-blue-100 border-arvo-blue-100"}`}
                onClick={() => setOpen(!open)}
            >
                <img
                    src={`${open ? "/icon/table-sort-selected.svg" : "/icon/table-sort.svg"}`}
                />
                <span
                    className={`${open ? "text-arvo-white-100" : "text-arvo-black-100"}`}
                >
                    {`Sort${selectedOption ? ": " + selectedOption.label : ""}`}
                </span>
            </button>
            {open && (
                <div className="absolute bg-arvo-white-0 rounded-xl overflow-clip z-10 shadow-md">
                    {options.map((option, index) => {
                        const optionkey = option.key + (option.order ?? "");
                        return (
                            <div
                                key={optionkey}
                                className={`px-4 py-1 hover:bg-arvo-blue-50 cursor-pointer whitespace-nowrap 
                                    ${index === options.length - 1 ? "pb-3" : index === 0 ? "pt-3" : ""}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TableSort;
