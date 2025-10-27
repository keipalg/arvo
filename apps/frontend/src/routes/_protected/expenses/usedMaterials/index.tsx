import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc } from "../../../../utils/trpcClient";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../../../../components/table/DataTable";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";

export const Route = createFileRoute("/_protected/expenses/usedMaterials/")({
    component: UsedMaterials,
});

type UsedMaterialPerSales =
    inferRouterOutputs<AppRouter>["sales"]["usedMaterialPerSales"][number] & {
        actions: string;
    };

function UsedMaterials() {
    const { data: usedMaterialPerSales } = useQuery(
        trpc.sales.usedMaterialPerSales.queryOptions(),
    );
    console.log("usedMaterialPerSales:", usedMaterialPerSales);

    const columns: Array<{
        key: keyof UsedMaterialPerSales;
        header: string;
        render?: (
            value: UsedMaterialPerSales[keyof UsedMaterialPerSales],
            row: UsedMaterialPerSales,
        ) => React.ReactNode;
    }> = [
        {
            key: "materialName",
            header: "Material Name",
        },
        {
            key: "usedMaterialCost",
            header: "Total Cost",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "soldDate",
            header: "Sold Date",
            render: (value) => {
                if (typeof value === "string" || value instanceof Date) {
                    const dateObj = new Date(value);
                    return isNaN(dateObj.getTime()) ? (
                        <></>
                    ) : (
                        <>{dateObj.toLocaleDateString()}</>
                    );
                }
                return <></>;
            },
        },
        {
            key: "salesNumber",
            header: "Sales Number",
            render: (value) => <>{`#${String(value).padStart(7, "0")}`}</>,
        },
        { key: "goodName", header: "Goods Name" },
    ];

    const tabledData = (usedMaterialPerSales ?? []).map((element) => ({
        ...element,
        actions: "",
    }));

    return (
        <BaseLayout title="Used Materials List">
            <div>
                <h3 className="">Used Materials List</h3>
            </div>
            <DataTable columns={columns} data={tabledData} />
        </BaseLayout>
    );
}
