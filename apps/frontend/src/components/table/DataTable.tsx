import type { ReactNode } from "react";

type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T]) => ReactNode;
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
            <div className="rounded-2xl border border-gray-100 overflow-clip">
                <table>
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className="px-6 py-3"
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
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className="px-6 py-3"
                                    >
                                        {column.render
                                            ? column.render(element[column.key])
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
