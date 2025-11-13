import type { UsedMaterialPerSales } from "../../routes/_protected/expenses/usedMaterials";

type DataTableDetailMaterialExpenseProps = {
    row: UsedMaterialPerSales;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const MaterialExpenseDetails = ({
    row,
    columnsLength,
    visibleMobileColumnsCount,
    isSmUp,
}: DataTableDetailMaterialExpenseProps) => {
    return (
        <>
            <td></td>
            <td
                colSpan={
                    isSmUp ? columnsLength - 1 : visibleMobileColumnsCount - 1
                }
                className="px-4 py-3"
            >
                {isSmUp ? (
                    <div className="grid grid-cols-5 gap-2">
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Cost Per Unit
                            </div>
                            <div className="text-arvo-black-100">
                                $ {row.costPerUnit} / {row.unit}
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Usage Quantity
                            </div>
                            <div className="text-arvo-black-100">
                                {row.materialOutputRatio} {row.unit}
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Sold Goods Number
                            </div>
                            <div className="text-arvo-black-100">
                                {row.quantity} unit sold
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="font-semibold">Sales Number</div>
                        <div>{`#${String(row.salesNumber).padStart(7, "0")}`}</div>

                        <div className="font-semibold">Goods Name</div>
                        <div>{row.goodName}</div>

                        <div className="font-semibold">Cost Per Unit</div>
                        <div>
                            $ {row.costPerUnit} / {row.unit}
                        </div>

                        <div className="font-semibold">Usage Quantity</div>
                        <div>
                            {row.materialOutputRatio} {row.unit}
                        </div>

                        <div className="font-semibold">Sold Goods Quantity</div>
                        <div>{row.quantity} unit sold</div>
                    </div>
                )}
                {/* <div className="grid w-full" style={gridStyle}>
					<div
						className="flex px-4 py-3 font-semibold"
						style={cellLabelStyle}
					>
						Name
					</div>
					<div className="px-4 py-3" style={cellValueStyle}>
						{row.materialName}
					</div>
					<div
						className="flex px-4 py-3 font-semibold"
						style={cellLabelStyle}
					>
						Cost
					</div>
					<div className="px-4 py-3" style={cellValueStyle}>
						{row.usedMaterialCost}
					</div>
					<div
						className="flex px-4 py-3 font-semibold items-center"
						style={cellLabelStyle}
					>
						Good Name
					</div>
					<div className="px-4 py-3" style={cellValueStyle}>
						{row.goodName}
					</div>
					<div
						className="flex px-4 py-3 font-semibold items-center"
						style={cellLabelStyle}
					>
						Sales Number
					</div>
					<div className="px-4 py-3" style={cellValueStyle}>
						{row.salesNumber}
					</div>
					<div
						className="flex px-4 py-3 font-semibold items-center"
						style={cellLabelStyle}
					>
						Sold Date
					</div>
					<div className="px-4 py-3" style={cellValueStyle}>
						{new Date(row.soldDate).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</div>
				</div> */}
            </td>
            <td></td>
        </>
    );
};

export default MaterialExpenseDetails;
