import { useState, type ReactNode } from "react";

type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    detailRender?: (row: T) => ReactNode;
    mobileVisibleKeys?: (keyof T)[];
};

const DataTable = <T extends { id: number | string }>({
    data,
    columns,
    detailRender,
    mobileVisibleKeys,
}: DataTableProps<T>) => {
    const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

    const toggleRow = (id: string | number) => {
        const key = String(id);
        setOpenRows((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const hasDetails = Boolean(detailRender);
    const defaultMobileSet = new Set<keyof T>();
    if (columns[0]) defaultMobileSet.add(columns[0].key);
    if (columns[1]) defaultMobileSet.add(columns[1].key);
    const actionsCol = columns.find((c) => String(c.key) === "actions");
    if (actionsCol) defaultMobileSet.add(actionsCol.key);

    const mobileSet = new Set<keyof T>(
        mobileVisibleKeys || Array.from(defaultMobileSet),
    );

    return (
        <>
            <div className="rounded-2xl border border-arvo-black-5 overflow-clip">
                <table className="w-full">
                    <thead className="bg-arvo-white-100 border-b border-arvo-black-5">
                        <tr>
                            {hasDetails && <th className="px-4 py-3" />}
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
                                        className={`text-left px-4 py-3 ${hideClass}`}
                                    >
                                        {column.header}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((element, index) => {
                            const rowKey = String(element.id);
                            const isOpen = !!openRows[rowKey];
                            const isEvenRow = index % 2 === 0;
                            const bgRow = isEvenRow
                                ? "bg-arvo-white-0"
                                : "bg-arvo-white-100";
                            return (
                                <>
                                    <tr
                                        className={`border-b border-gray-200 ${bgRow}`}
                                        key={rowKey}
                                        data-id={element.id}
                                    >
                                        {hasDetails && (
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        toggleRow(element.id)
                                                    }
                                                    className="flex items-center justify-center"
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
                                                !mobileSet.has(column.key);
                                            const hideClass = isHiddenOnMobile
                                                ? "hidden sm:table-cell"
                                                : "";
                                            return (
                                                <td
                                                    key={String(column.key)}
                                                    className={`px-4 py-3 ${hideClass}`}
                                                >
                                                    {column.render
                                                        ? column.render(
                                                              element[
                                                                  column.key
                                                              ],
                                                              element,
                                                          )
                                                        : String(
                                                              element[
                                                                  column.key
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
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DataTable;
