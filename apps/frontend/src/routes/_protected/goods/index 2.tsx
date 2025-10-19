import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { trpc } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";
import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";

export const Route = createFileRoute("/_protected/goods/index 2")({
    component: GoodsList,
});

type Goods = inferRouterOutputs<AppRouter>["goods"]["list"][number] & {
    actions: string;
};

function GoodsList() {
    const { data, isLoading, error } = useQuery(trpc.goods.list.queryOptions());
    console.log("Raw data:", data);

    const columns: Array<{
        key: keyof Goods;
        header: string;
        render?: (value: Goods[keyof Goods]) => React.ReactNode;
    }> = [
        {
            key: "name",
            header: "Product Name",
        },
        {
            key: "type",
            header: "Product Type",
        },
        {
            key: "inventoryQuantity",
            header: "Inventory Quantity",
        },
        {
            key: "producedQuantity",
            header: "Produced Quantity",
        },
        {
            key: "retailPrice",
            header: "Unit Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
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
        <BaseLayout title="Product List">
            <h3 className="">Your Products</h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
        </BaseLayout>
    );
}
