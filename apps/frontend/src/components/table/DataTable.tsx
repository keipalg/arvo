import type { ReactNode } from "react";

type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
};

const DataTable = <T extends { id: number | string }>({
    data,
    columns,
}: DataTableProps<T>) => {
    return (
        <>
            <div className="rounded-2xl border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className="text-left px-4 py-3"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((element) => (
                            <tr
                                className="border-b border-gray-200"
                                key={element.id}
                                data-id={element.id}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className="px-4 py-3"
                                    >
                                        {column.render
                                            ? column.render(
                                                  element[column.key],
                                                  element,
                                              )
                                            : String(element[column.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DataTable;
