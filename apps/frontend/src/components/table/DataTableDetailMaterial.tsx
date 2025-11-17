import type { inferRouterOutputs } from "@trpc/server";
import { getFormattedDate } from "../../utils/dateFormatter";
import type { AppRouter } from "../../utils/trpcClient";
import InventoryStatus from "../badge/InventoryStatus";

type Materials = inferRouterOutputs<AppRouter>["materials"]["list"][number] & {
    actions: string;
};

type DataTableDetailMaterialProps = {
    row: Materials;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const MaterialDetails = ({ row, isSmUp }: DataTableDetailMaterialProps) => {
    const labelStyle = `${isSmUp ? "text-m" : "text-sm"} font-semibold text-arvo-black-50`;
    const valueStyle = `${isSmUp ? "text-m" : "text-sm"} text-arvo-black-100`;

    return (
        <>
            {isSmUp ? (
                <>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Last Purchase Date</div>
                        <div className={valueStyle}>
                            {getFormattedDate(row.lastPurchaseDate)}
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Supplier</div>
                        <div className={valueStyle}>
                            <div className="flex items-center gap-2">
                                <span>{row.supplier || "N/A"}</span>
                                {row.supplierUrl && (
                                    <a
                                        href={row.supplierUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer"
                                    >
                                        <img
                                            src="/icon/arrow-trend-upward.svg"
                                            alt="Visit supplier"
                                            className="w-4 h-4"
                                        />
                                    </a>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Min. Stock Level</div>
                        <div className={valueStyle}>
                            {row.threshold
                                ? `${row.threshold} ${row.unitAbbreviation}`
                                : "Not set"}
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Unit</div>
                        <div className={valueStyle}>
                            {row.unitName} ({row.unitAbbreviation})
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Notes</div>
                        <div className={valueStyle}>{row.notes || "N/A"}</div>
                    </td>
                </>
            ) : (
                <>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 align-top">
                        <div className={labelStyle}>Quantity</div>
                        <div className={valueStyle}>
                            {row.formattedQuantity}
                        </div>
                        <div className={`${labelStyle} mt-4`}>Unit Price</div>
                        <div className={valueStyle}>
                            ${Number(row.costPerUnit).toFixed(2)}
                        </div>
                        <div className={`${labelStyle} mt-4`}>Status</div>
                        <div className={valueStyle}>
                            <InventoryStatus statusKey={row.status} />
                        </div>
                        <div className={`${labelStyle} mt-4`}>
                            Last Purchase Date
                        </div>
                        <div className={valueStyle}>
                            {getFormattedDate(row.lastPurchaseDate)}
                        </div>
                    </td>
                    <td className="px-4 py-3 align-top" colSpan={2}>
                        <div className={labelStyle}>Supplier</div>
                        <div className={valueStyle}>
                            <div className="flex items-center gap-2">
                                <span>{row.supplier || "N/A"}</span>
                                {row.supplierUrl && (
                                    <a
                                        href={row.supplierUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer"
                                    >
                                        <img
                                            src="/icon/arrow-trend-upward.svg"
                                            alt="Visit supplier"
                                            className="w-4 h-4"
                                        />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className={`${labelStyle} mt-4`}>
                            Min. Stock Level
                        </div>
                        <div className={valueStyle}>
                            {row.threshold
                                ? `${row.threshold} ${row.unitAbbreviation}`
                                : "Not set"}
                        </div>
                        <div className={`${labelStyle} mt-4`}>Unit</div>
                        <div className={valueStyle}>
                            {row.unitName} ({row.unitAbbreviation})
                        </div>
                        <div className={`${labelStyle} mt-4`}>Notes</div>
                        <div className={valueStyle}>{row.notes || "N/A"}</div>
                    </td>
                </>
            )}
        </>
    );
};

export default MaterialDetails;
