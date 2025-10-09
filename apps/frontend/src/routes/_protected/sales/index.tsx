import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { trpc } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";

export const Route = createFileRoute("/_protected/sales/")({
    component: SalesList,
});

type Sales = inferRouterOutputs<AppRouter>["sales"]["list"][number] & {
    actions: string;
};

function SalesList() {
    const { data, isLoading, error } = trpc.sales.list.useQuery();
    const columns: Array<{
        key: keyof Sales;
        header: string;
        render?: (value: Sales[keyof Sales]) => React.ReactNode;
    }> = [
        {
            key: "salesNumber",
            header: "Sales Number",
            render: (value) => <>#{String(value).padStart(7, "0")}</>,
        },
        { key: "customer", header: "Customer" },
        {
            key: "totalPrice",
            header: "Total Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "date",
            header: "Date",
            render: (value) => <>{new Date(value).toLocaleDateString()}</>,
        },
        { key: "channel", header: "Channel" },
        { key: "status", header: "Status" },
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
        <BaseLayout title="Sales List">
            <h3 className="">Sales</h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
        </BaseLayout>
    );
}
