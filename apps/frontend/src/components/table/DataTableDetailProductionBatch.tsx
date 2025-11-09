import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../utils/trpcClient";
import { calculateMaterialCost } from "../../utils/pricing.ts";
import { trpc } from "../../utils/trpcClient";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";

type ProductionBatch =
    inferRouterOutputs<AppRouter>["productionBatch"]["list"][number] & {
        actions: string;
    };

type DataTableDetailBatchProps = {
    row: ProductionBatch;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const BatchDetails = ({
    row,
    columnsLength,
    visibleMobileColumnsCount,
    isSmUp,
}: DataTableDetailBatchProps) => {
    const [showMaterialsPopup, setShowMaterialsPopup] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const { data: materialOutputRatioData } = useQuery(
        trpc.goods.materialOutputRatio.queryOptions(),
    );

    // Handle click outside to close tooltip
    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (
                tooltipRef.current &&
                event.target &&
                !tooltipRef.current.contains(event.target as Node)
            ) {
                setShowMaterialsPopup(false);
            }
        };

        if (showMaterialsPopup) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [showMaterialsPopup]);

    const filterMaterials = () => {
        if (materialOutputRatioData) {
            return materialOutputRatioData
                .filter((mor) => mor.id === row.id)
                .map((mor) => ({
                    materialId: mor?.materialId || "",
                    name: mor?.materialName || "",
                    amount: mor?.input || 0,
                    unitAbbreviation: mor?.abbreviation || "",
                    costPerUnit: mor?.costPerUnit || 0,
                    materialCost: calculateMaterialCost(
                        mor?.input || 0,
                        mor?.costPerUnit || 0,
                    ),
                }));
        } else {
            return [];
        }
    };
    const filteredMaterials = filterMaterials();
    console.log(filteredMaterials);
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
                        Production Date
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.productionDate}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Product Name
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.goodName}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold items-center"
                        style={cellLabelStyle}
                    >
                        Quantity
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.quantity}
                    </div>

                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Material Cost
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        ${Number(row.productionCost).toFixed(2)}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Notes
                    </div>
                    <div
                        className="px-4 py-3 break-words"
                        style={cellValueStyle}
                    >
                        {row.notes}
                    </div>
                </div>
            </td>
            <td></td>
        </>
    );
};

export default BatchDetails;
