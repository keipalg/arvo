import React, { useMemo, useState, type ReactNode } from "react";
import TableSort from "./TableSort";
import TableFilter from "./TableFilter";
import TableSearch from "./TableSearch";
import { useIsSmUp } from "../../utils/screenWidth";

export type FilterOption<T> = {
    key: keyof T;
    label: string;
    values: {
        key: string;
        label: string;
    }[];
};

export type SortOption<T> = {
    key: keyof T;
    label: string;
    order?: "asc" | "desc";
};

export type SearchOption<T> = {
    key: keyof T;
    label: string;
};

type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    detailRender?: (row: T) => ReactNode;
    detailVisibility?: "both" | "mobile" | "desktop";
    mobileVisibleKeys?: (keyof T)[];
    sortOptions?: SortOption<T>[];
    filterOptions?: FilterOption<T>[];
    searchOption?: SearchOption<T>;
};

const DataTable = <T extends { id: number | string }>({
    data,
    columns,
    detailRender,
    detailVisibility = "both",
    mobileVisibleKeys,
    sortOptions,
    filterOptions,
    searchOption,
}: DataTableProps<T>) => {
    const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
    const [selectedSort, setSelectedSort] = useState<SortOption<T> | null>(
        sortOptions?.[0] || null,
    );

    const [selectedFilter, setSelectedFilter] = useState<{
        columnKey: keyof T;
        value: string;
    } | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const toggleRow = (id: string | number) => {
        const key = String(id);
        setOpenRows((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isSmUp = useIsSmUp();
    const hasDetails = Boolean(detailRender);
    const showDetails =
        hasDetails &&
        (detailVisibility === "both" ||
            (detailVisibility === "mobile" && !isSmUp) ||
            (detailVisibility === "desktop" && isSmUp));
    const defaultMobileSet = new Set<keyof T>();
    if (columns[0]) defaultMobileSet.add(columns[0].key);
    if (columns[1]) defaultMobileSet.add(columns[1].key);
    const actionsCol = columns.find((c) => String(c.key) === "actions");
    if (actionsCol) defaultMobileSet.add(actionsCol.key);

    const mobileSet = new Set<keyof T>(
        mobileVisibleKeys || Array.from(defaultMobileSet),
    );

    const tableFilterOptions =
        (filterOptions ?? []).map((opt) => {
            const actualKey = String(opt.key).split(":")[0];

            return {
                key: String(opt.key), // Keep the full unique key for UI tracking
                label: opt.label,
                values:
                    (opt.values ?? []).map((v) => ({
                        key: `${actualKey}:${String(v.key)}`, // Use actual key for filtering
                        label: String(v.label),
                    })) ?? [],
            };
        }) ?? [];

    const sortedData = useMemo(() => {
        // Apply filter
        let filtered = data;
        if (selectedFilter) {
            const col = selectedFilter.columnKey;
            const val = selectedFilter.value;
            filtered = data.filter((item) => {
                const itemVal = item[col];
                const itemValStr = String(itemVal);
                const valStr = String(val);

                // Support partial matching: if filter value looks like a date prefix (YYYY-MM),
                // use startsWith for matching. Otherwise use exact match.
                if (/^\d{4}-\d{2}$/.test(valStr)) {
                    return itemValStr.startsWith(valStr);
                }

                return itemValStr === valStr;
            });
        }

        // Apply search
        if (searchOption && searchTerm.trim()) {
            const searchKey = searchOption.key;
            const lowerSearchTerm = searchTerm.trim().toLowerCase();
            filtered = filtered.filter((item) => {
                const itemVal = item[searchKey];
                if (itemVal == null) return false;
                return String(itemVal).toLowerCase().includes(lowerSearchTerm);
            });
        }

        // Apply sorting
        if (!selectedSort) return filtered;
        const key = selectedSort.key;
        const factor = selectedSort.order === "desc" ? -1 : 1;

        const compareValues = (av: T[keyof T], bv: T[keyof T]): number => {
            // null
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;

            // Date
            if (av instanceof Date && bv instanceof Date) {
                return av.getTime() - bv.getTime();
            }

            // boolean
            if (typeof av === "boolean" || typeof bv === "boolean") {
                return Number(Boolean(av)) - Number(Boolean(bv));
            }

            // number
            if (typeof av === "number" && typeof bv === "number") {
                return av - bv;
            }

            // string fallback
            return String(av).localeCompare(String(bv), undefined, {
                numeric: true,
                sensitivity: "base",
            });
        };

        return [...filtered]
            .map((item, idx) => ({ item, idx }))
            .sort((a, b) => {
                const av = a.item[key];
                const bv = b.item[key];
                const cmp = compareValues(av, bv);
                if (cmp !== 0) return cmp * factor;
                return a.idx - b.idx;
            })
            .map((x) => x.item);
    }, [data, selectedSort, selectedFilter, searchTerm]);

    return (
        <>
            <div>
                <div className="sm:flex sm:justify-between my-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <TableSort
                            options={
                                sortOptions
                                    ? sortOptions.map((opt) => ({
                                          key: String(opt.key),
                                          label: opt.label,
                                          order: opt.order,
                                      }))
                                    : []
                            }
                            onSelect={(option) => {
                                const found = sortOptions?.find(
                                    (opt) =>
                                        String(opt.key) === option.key &&
                                        (opt.order ?? undefined) ===
                                            option.order,
                                );
                                setSelectedSort(found ?? null);
                            }}
                        />
                        <TableFilter
                            options={tableFilterOptions}
                            onSelect={(option) => {
                                const parts = option?.key.split(":", 2);
                                if (parts && parts.length === 2) {
                                    setSelectedFilter({
                                        columnKey: parts[0] as keyof T,
                                        value: parts[1],
                                    });
                                } else {
                                    setSelectedFilter(null);
                                }
                            }}
                        />
                    </div>
                    <div className="w-full sm:w-96">
                        <TableSearch
                            placeholder={
                                searchOption
                                    ? `Search ${searchOption.label}...`
                                    : "Search"
                            }
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[800px] max-w-full rounded-2xl border border-arvo-black-5 overflow-clip">
                    <table className="w-full">
                        <thead className="bg-arvo-white-100 border-b border-arvo-black-5 sticky top-0 z-10 shadow-md">
                            <tr>
                                {showDetails && <th className="px-4 py-3" />}
                                {columns.map((column) => {
                                    const isHiddenOnMobile = !mobileSet.has(
                                        column.key,
                                    );
                                    const hideClass = isHiddenOnMobile
                                        ? "hidden sm:table-cell"
                                        : "";
                                    return (
                                        <th
                                            key={String(column.key)}
                                            className={`text-left py-3 ${hideClass}`}
                                        >
                                            <div className="border-l border-arvo-black-5 px-4">
                                                <span>{column.header}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            columns.length +
                                            (showDetails ? 1 : 0)
                                        }
                                        className="px-4 py-6 text-center text-arvo-black-50"
                                    >
                                        No data
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((element, index) => {
                                    const rowKey = String(element.id);
                                    const isOpen = !!openRows[rowKey];
                                    const isEvenRow = index % 2 === 0;
                                    const bgRow = isEvenRow
                                        ? "bg-arvo-white-0"
                                        : "bg-arvo-white-100";
                                    return (
                                        <React.Fragment key={rowKey}>
                                            <tr
                                                className={`border-b border-gray-200 ${bgRow}`}
                                                key={rowKey}
                                                data-id={element.id}
                                            >
                                                {showDetails && (
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() =>
                                                                toggleRow(
                                                                    element.id,
                                                                )
                                                            }
                                                            className="hover:cursor-pointer"
                                                        >
                                                            <img
                                                                src="/icon/arrow-down.svg"
                                                                alt="Expand/Collapse"
                                                                className={`w-6 min-w-6 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
                                                            />
                                                        </button>
                                                    </td>
                                                )}
                                                {columns.map((column) => {
                                                    const isHiddenOnMobile =
                                                        !mobileSet.has(
                                                            column.key,
                                                        );
                                                    const hideClass =
                                                        isHiddenOnMobile
                                                            ? "hidden sm:table-cell"
                                                            : "";
                                                    return (
                                                        <td
                                                            key={String(
                                                                column.key,
                                                            )}
                                                            className={`px-4 py-3 ${hideClass}`}
                                                        >
                                                            {column.render
                                                                ? column.render(
                                                                      element[
                                                                          column
                                                                              .key
                                                                      ],
                                                                      element,
                                                                  )
                                                                : String(
                                                                      element[
                                                                          column
                                                                              .key
                                                                      ],
                                                                  )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            {isOpen && detailRender && (
                                                <tr
                                                    key={rowKey + "_detail"}
                                                    className="border-b border-gray-200"
                                                >
                                                    {detailRender(element)}
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DataTable;
