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
    const desktopCols = Math.max(columnsLength, 2);
    const mobileCols = Math.max(visibleMobileColumnsCount - 1, 1);
    const gridStyle = {
        gridTemplateColumns: `repeat(${isSmUp ? desktopCols : mobileCols}, minmax(0, 1fr))`,
    } as React.CSSProperties;

    const valueSpanDesktop = Math.max(desktopCols - 1, 1);
    const valueSpanMobile = 1;
    const valueSpan = isSmUp ? valueSpanDesktop : valueSpanMobile;

    const cellLabelStyle = { gridColumn: "span 1" } as React.CSSProperties;
    const cellValueStyle = {
        gridColumn: `span ${valueSpan}`,
    } as React.CSSProperties;

    return (
        <>
            <td></td>
            <td
                colSpan={
                    isSmUp ? columnsLength - 1 : visibleMobileColumnsCount - 1
                }
                className="px-4 py-3"
            >
                <div className="grid w-full" style={gridStyle}>
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
                </div>
            </td>
            <td></td>
        </>
    );
};

export default MaterialExpenseDetails;
