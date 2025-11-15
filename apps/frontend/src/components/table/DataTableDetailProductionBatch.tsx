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

const BatchDetails = ({ row, isSmUp }: DataTableDetailBatchProps) => {
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

    const labelStyle = `${isSmUp ? "text-sm" : "text-xs"} font-semibold text-arvo-black-50`;
    const valueStyle = `${isSmUp ? "text-sm" : "text-xs"}  text-arvo-black-100`;

    return (
        <>
            {isSmUp ? (
                <>
                    <td></td>
                    <td colSpan={4} className="p-0">
                        <div>
                            <table className="w-full">
                                <tbody>
                                    <tr className="align-text-top border-b border-arvo-black-5">
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Production Date
                                            </div>
                                            <div className={valueStyle}>
                                                {row.productionDate}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Product Name
                                            </div>
                                            <div className={valueStyle}>
                                                {row.goodName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Quantity
                                            </div>
                                            <div className={valueStyle}>
                                                {row.quantity}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Material Cost
                                            </div>
                                            <div className={valueStyle}>
                                                $
                                                {Number(
                                                    row.productionCost,
                                                ).toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="align-text-top border-b border-arvo-black-5">
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Note
                                            </div>
                                            <div className={valueStyle}>
                                                {row.notes ? row.notes : "-"}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                    <td></td>
                </>
            ) : (
                <>
                    <td></td>
                    <td colSpan={2} className="p-0">
                        <div>
                            <table className="w-full">
                                <tbody>
                                    <tr className="align-text-top">
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Production Date
                                            </div>
                                            <div className={valueStyle}>
                                                {row.productionDate}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Product Name
                                            </div>
                                            <div className={valueStyle}>
                                                {row.goodName}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="align-text-top">
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Quantity
                                            </div>
                                            <div className={valueStyle}>
                                                {row.quantity}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Material Cost
                                            </div>
                                            <div className={valueStyle}>
                                                $
                                                {Number(
                                                    row.productionCost,
                                                ).toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>

                                    <tr className="align-text-top">
                                        <td className="px-4 py-3" colSpan={1}>
                                            <div className={labelStyle}>
                                                Note
                                            </div>
                                            <div className={valueStyle}>
                                                {row.notes ? row.notes : "-"}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                    <td></td>
                </>
            )}
        </>
    );
};

export default BatchDetails;
