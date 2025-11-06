import type { inferRouterOutputs } from "@trpc/server";
import SalesStatus from "../badge/SalesStatus";
import type { AppRouter } from "../../utils/trpcClient";

type Sales = inferRouterOutputs<AppRouter>["sales"]["list"][number] & {
    actions: string;
};

type DataTableDetailSaleProps = {
    row: Sales;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const SaleDetails = ({
    row,
    columnsLength,
    visibleMobileColumnsCount,
    isSmUp,
}: DataTableDetailSaleProps) => {
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
                        Customer
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.customer}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Channel
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.channel}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold items-center"
                        style={cellLabelStyle}
                    >
                        Date
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {new Date(row.date).toDateString()}
                    </div>

                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Status
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        <SalesStatus statusKey={String(row.status)} />
                    </div>
                </div>
            </td>
            <td></td>
        </>
    );
};

export default SaleDetails;
