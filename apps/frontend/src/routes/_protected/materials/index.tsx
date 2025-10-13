import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { trpc } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";

export const Route = createFileRoute("/_protected/materials/")({
    component: MaterialsList,
});

type Materials = inferRouterOutputs<AppRouter>["materials"]["list"][number] & {
    actions: string;
};

function MaterialsList() {
    const { data, isLoading, error } = trpc.materials.list.useQuery();
    const columns: Array<{
        key: keyof Materials;
        header: string;
        render?: (value: Materials[keyof Materials]) => React.ReactNode;
    }> = [
        { key: "type", header: "Type" },
        { key: "name", header: "Item" },
        { key: "quantity", header: "Quantity" },
        {
            key: "totalCost",
            header: "Cost",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "lastPurchaseDate",
            header: "Last Purchase Date",
            render: (value) => (
                <>{new Date(value as Date).toLocaleDateString()}</>
            ),
        },
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
        <BaseLayout title="Materials List">
            <h3 className="">Materials</h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
        </BaseLayout>
    );
}
