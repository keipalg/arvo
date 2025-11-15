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

const MaterialDetails = ({
    row,
    columnsLength,
    visibleMobileColumnsCount,
    isSmUp,
}: DataTableDetailMaterialProps) => {
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
                    // Desktop layout - 5 columns
                    <div className="grid grid-cols-5 gap-2">
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Last Purchase Date
                            </div>
                            <div className="text-arvo-black-100">
                                {getFormattedDate(row.lastPurchaseDate)}
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Supplier
                            </div>
                            <div className="text-arvo-black-100 flex items-center gap-2">
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
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Min. Stock Level
                            </div>
                            <div className="text-arvo-black-100">
                                {row.threshold
                                    ? `${row.threshold} ${row.unitAbbreviation}`
                                    : "Not set"}
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Unit
                            </div>
                            <div className="text-arvo-black-100">
                                {row.unitName} ({row.unitAbbreviation})
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Notes
                            </div>
                            <div className="text-arvo-black-100">
                                {row.notes || "N/A"}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Mobile layout - stacked label-value pairs
                    <div className="grid grid-cols-2 gap-2">
                        <div className="font-semibold">Quantity</div>
                        <div>{row.formattedQuantity}</div>

                        <div className="font-semibold">Unit Price</div>
                        <div>${Number(row.costPerUnit).toFixed(2)}</div>

                        <div className="font-semibold">Status</div>
                        <div>
                            <InventoryStatus statusKey={row.status} />
                        </div>

                        <div className="font-semibold">Last Purchase Date</div>
                        <div>{getFormattedDate(row.lastPurchaseDate)}</div>

                        <div className="font-semibold">Supplier</div>
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

                        <div className="font-semibold">Min. Stock Level</div>
                        <div>
                            {row.threshold
                                ? `${row.threshold} ${row.unitAbbreviation}`
                                : "Not set"}
                        </div>

                        <div className="font-semibold">Unit</div>
                        <div>
                            {row.unitName} ({row.unitAbbreviation})
                        </div>

                        {row.notes && (
                            <>
                                <div className="font-semibold">Notes</div>
                                <div>{row.notes}</div>
                            </>
                        )}
                    </div>
                )}
            </td>
            <td></td>
        </>
    );
};

export default MaterialDetails;
