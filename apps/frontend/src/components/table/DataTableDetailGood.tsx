import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../utils/trpcClient";
import { calculateMaterialCost } from "../../utils/pricing.ts";
import { trpc } from "../../utils/trpcClient";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";

type Goods = inferRouterOutputs<AppRouter>["goods"]["list"][number] & {
    actions: string;
};

type DataTableDetailGoodProps = {
    row: Goods;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const GoodDetails = ({
    row,
    columnsLength,
    visibleMobileColumnsCount,
    isSmUp,
}: DataTableDetailGoodProps) => {
    const [showMaterialsPopup, setShowMaterialsPopup] = useState(false);
    const [isNarrowScreen, setIsNarrowScreen] = useState(
        window.innerWidth < 1000,
    );
    const tooltipRef = useRef<HTMLDivElement>(null);

    const { data: materialOutputRatioData } = useQuery(
        trpc.goods.materialOutputRatio.queryOptions(),
    );

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsNarrowScreen(window.innerWidth < 1000);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                        Name
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.name}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Type
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.type}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold items-center"
                        style={cellLabelStyle}
                    >
                        Stock
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.inventoryQuantity}
                    </div>

                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Unit Price
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        $ {row.retailPrice}
                    </div>

                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Min. Stock
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.minimumStockLevel}
                    </div>

                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Materials
                    </div>

                    <div className="px-4 py-3 relative" style={cellValueStyle}>
                        {isNarrowScreen ? (
                            <div className="relative" ref={tooltipRef}>
                                <button
                                    onClick={() =>
                                        setShowMaterialsPopup(
                                            !showMaterialsPopup,
                                        )
                                    }
                                    className="text-arvo-blue-100 underline cursor-pointer font-semibold"
                                >
                                    View ({filteredMaterials.length})
                                </button>
                                <div
                                    className={`
                                        ${showMaterialsPopup ? "visible opacity-100" : "invisible opacity-0"}
                                        absolute w-72 bg-arvo-white-0 border border-arvo-black-5 rounded-2xl font-semibold text-base p-4 z-10 shadow-lg transition-all duration-300 ease-in-out bottom-full mb-2 -left-32
                                    `}
                                >
                                    <div className="space-y-2">
                                        {filteredMaterials.map((material) => (
                                            <div
                                                key={material.materialId}
                                                className="grid grid-cols-[1fr_auto_auto] gap-2 py-1"
                                            >
                                                <div className="font-medium">
                                                    {material.name}
                                                </div>
                                                <div>{material.amount}</div>
                                                <div>
                                                    {material.unitAbbreviation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            filteredMaterials.map((material) => (
                                <div
                                    key={material.materialId}
                                    className="grid grid-cols-[85%_10%_5%] max-w-60"
                                >
                                    <div>{material.name}</div>
                                    <div>{material.amount}</div>
                                    <div>{material.unitAbbreviation}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </td>
            <td></td>
        </>
    );
};

export default GoodDetails;
