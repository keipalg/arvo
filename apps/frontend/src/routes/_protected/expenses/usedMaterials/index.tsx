import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc } from "../../../../utils/trpcClient";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_protected/expenses/usedMaterials/")({
    component: UsedMaterials,
});

function UsedMaterials() {
    const { data: usedMaterialPerSales } = useQuery(
        trpc.sales.usedMaterialPerSales.queryOptions(),
    );
    console.log("usedMaterialPerSales:", usedMaterialPerSales);

    return (
        <BaseLayout title="Used Materials List">
            <div>
                <h3 className="">Used Materials List</h3>
            </div>
            {/* <DataTable
				columns={columns}
				data={tabledData}
			/> */}
        </BaseLayout>
    );
}
