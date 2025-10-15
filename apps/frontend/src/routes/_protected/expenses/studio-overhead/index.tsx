import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../../../../utils/trpcClient";
import BaseLayout from "../../../../components/BaseLayout";
import DataTable from "../../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";

export const Route = createFileRoute("/_protected/expenses/studio-overhead/")({
    component: StudioOverhead,
});

type StudioOverheadExpense =
    inferRouterOutputs<AppRouter>["studioOverheadExpense"]["list"][number] & {
        actions: string;
    };

function StudioOverhead() {
    const { data, isLoading, error } =
        trpc.studioOverheadExpense.list.useQuery();

    const columns: Array<{
        key: keyof StudioOverheadExpense;
        header: string;
        render?: (
            value: StudioOverheadExpense[keyof StudioOverheadExpense],
        ) => React.ReactNode;
    }> = [
        {
            key: "createdAt",
            header: "Date",
            render: (value) => <>{new Date(value).toLocaleDateString()}</>,
        },
        {
            key: "name",
            header: "Name",
        },
        {
            key: "expense_type",
            header: "Category",
        },
        {
            key: "payee",
            header: "Payee",
        },
        {
            key: "quantity",
            header: "Quantity",
        },
        {
            key: "actions",
            header: "Actions",
            render: () => (
                <>
                    <div className="flex gap-2">
                        <button className="text-blue-400 hover:underline">
                            Edit
                        </button>
                        <button className="text-blue-400 hover:underline">
                            Delete
                        </button>
                    </div>
                </>
            ),
        },
    ];

    const tabledData = data?.map((element) => ({
        ...element,
        actions: "",
    }));

    return (
        <BaseLayout title="Studio Overhead Expenses List">
            <h3 className="">Studio Overhead Expenses List</h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
        </BaseLayout>
    );
}
