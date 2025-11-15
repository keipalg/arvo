import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../utils/trpcClient";
import { calculateMaterialCost, getCOGS } from "../../utils/pricing.ts";
import { trpc } from "../../utils/trpcClient";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import CostBreakDown from "../pricing/CostBreakDown.tsx";

type Goods = inferRouterOutputs<AppRouter>["goods"]["list"][number] & {
    actions: string;
};

type DataTableDetailGoodProps = {
    row: Goods;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const GoodDetails = ({ row, isSmUp }: DataTableDetailGoodProps) => {
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
    const labelStyle = `${isSmUp ? "text-sm" : "text-xs"} font-semibold text-arvo-black-50`;
    const valueStyle = `${isSmUp ? "text-sm" : "text-xs"}  text-arvo-black-100`;

    return (
        <>
            {isSmUp ? (
                <>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Min. Stock Level</div>
                        <div className={valueStyle}>
                            {row.minimumStockLevel}
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top" colSpan={2}>
                        <div className={labelStyle}>Materials per Item</div>
                        <div className={valueStyle}>
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material.materialId}
                                    className="flex flex-3 gap-1 grow"
                                >
                                    <div className="mr-4">{material.name}</div>
                                    <div>{material.amount}</div>
                                    <div>{material.unitAbbreviation}</div>
                                </div>
                            ))}
                            {filteredMaterials.length > 0 && (
                                <div className="relative" ref={tooltipRef}>
                                    <button
                                        onClick={() =>
                                            setShowMaterialsPopup(
                                                !showMaterialsPopup,
                                            )
                                        }
                                        className={`${valueStyle}  !m-0 text-left text-arvo-blue-100 underline cursor-pointer font-medium ml-1.5`}
                                    >
                                        View cost Cost Brake Down
                                    </button>
                                    <div
                                        className={`
                                            ${showMaterialsPopup ? "visible opacity-100" : "invisible opacity-0"}
                                            absolute w-72 bg-arvo-white-0 border border-arvo-black-5 rounded-2xl font-semibold text-base overflow-visible z-10 shadow-lg transition-all duration-300 ease-in-out bottom-full -left-32
                                            `}
                                    >
                                        <CostBreakDown
                                            mor={
                                                !row.materialCost
                                                    ? "0.00"
                                                    : row.materialCost.toFixed(
                                                          2,
                                                      )
                                            }
                                            cogs={getCOGS(
                                                row.materialCost ?? 0,
                                                Number(row.laborCost),
                                                Number(row.overheadCost),
                                            ).toFixed(2)}
                                            operatingCosts={
                                                row.operatingCost
                                                    ? Number(
                                                          row.operatingCost,
                                                      ).toFixed(2)
                                                    : "0.00"
                                            }
                                            profitMargin={
                                                !row.netProfit
                                                    ? "0.00"
                                                    : Number(
                                                          row.netProfit,
                                                      ).toFixed(2)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Note</div>
                        <div className={valueStyle}>
                            {row.note ? row.note : "-"}
                        </div>
                    </td>
                </>
            ) : (
                <>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 align-top" colSpan={2}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                    <div className={labelStyle}>
                                        Product Name
                                    </div>
                                    <div className={valueStyle}>{row.name}</div>
                                </div>
                                <div>
                                    <div className={labelStyle}>
                                        Product Type
                                    </div>
                                    <div className={valueStyle}>{row.type}</div>
                                </div>
                                <div>
                                    <div className={labelStyle}>
                                        Stock Level
                                    </div>
                                    <div className={valueStyle}>
                                        {row.inventoryQuantity}
                                    </div>
                                </div>
                                <div>
                                    <div className={labelStyle}>Unit Price</div>
                                    <div className={valueStyle}>
                                        ${Number(row.retailPrice).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div className={labelStyle}>
                                        Min. Stock Level
                                    </div>
                                    <div className={valueStyle}>
                                        {row.minimumStockLevel}
                                    </div>
                                </div>
                                <div>
                                    <div className={labelStyle}>
                                        Materials per Item
                                    </div>
                                    <div className={valueStyle}>
                                        {filteredMaterials.map((material) => (
                                            <div
                                                key={material.materialId}
                                                className="flex flex-3 gap-1 grow"
                                            >
                                                <div className="mr-4">
                                                    {material.name}
                                                </div>
                                                <div>{material.amount}</div>
                                                <div>
                                                    {material.unitAbbreviation}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredMaterials.length > 0 && (
                                            <div
                                                className="relative"
                                                ref={tooltipRef}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setShowMaterialsPopup(
                                                            !showMaterialsPopup,
                                                        )
                                                    }
                                                    className={`${valueStyle}  !m-0 text-left text-arvo-blue-100 underline cursor-pointer font-medium ml-1.5`}
                                                >
                                                    Cost Brake Down
                                                </button>
                                                <div
                                                    className={`
                                                        ${showMaterialsPopup ? "visible opacity-100" : "invisible opacity-0"}
                                                        absolute w-72 bg-arvo-white-0 border border-arvo-black-5 rounded-2xl font-semibold text-base overflow-visible z-10 shadow-lg transition-all duration-300 ease-in-out bottom-full -left-32
                                                        `}
                                                >
                                                    <CostBreakDown
                                                        mor={
                                                            !row.materialCost
                                                                ? "0.00"
                                                                : row.materialCost.toFixed(
                                                                      2,
                                                                  )
                                                        }
                                                        cogs={getCOGS(
                                                            row.materialCost ??
                                                                0,
                                                            Number(
                                                                row.laborCost,
                                                            ),
                                                            Number(
                                                                row.overheadCost,
                                                            ),
                                                        ).toFixed(2)}
                                                        operatingCosts={
                                                            row.operatingCost
                                                                ? Number(
                                                                      row.operatingCost,
                                                                  ).toFixed(2)
                                                                : "0.00"
                                                        }
                                                        profitMargin={
                                                            !row.netProfit
                                                                ? "0.00"
                                                                : Number(
                                                                      row.netProfit,
                                                                  ).toFixed(2)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className={labelStyle}>Note</div>
                                <div className={valueStyle}>
                                    {row.note ? row.note : "-"}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3"></td>
                </>
            )}
        </>
    );
};

export default GoodDetails;
