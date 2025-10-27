import { createFileRoute } from '@tanstack/react-router'
import BaseLayout from '../../../../components/BaseLayout';
import { trpc } from '../../../../utils/trpcClient';
import { useQueries, useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_protected/expenses/usedMaterials/')({
	component: UsedMaterials,
})


function UsedMaterials() {
	const {
		data: salesList,
	} = useQuery(trpc.sales.list.queryOptions());
	console.log("Sales List:", salesList);

	const goodsQueries = useQueries({
		queries:
			salesList?.map(sale => {
				const queryOptions = trpc.goods.recipe.queryOptions({
					goodIDs: sale.products.map(p => p.goodId),
				});

				return {
					...queryOptions,
					enabled: sale.products.length > 0,
					select: (data) => ({ salesId: sale.id, data }),
				};
			}) || [],
	});

	goodsQueries.forEach(q => {
		if (q.status === "success") {
			console.log("Good Recipe:", q.data);
		}
	});

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
