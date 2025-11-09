import type { BusinessExpenseWithActions } from "../../routes/_protected/expenses/business";

type DataTableDetailBusinessExpenseProps = {
    row: BusinessExpenseWithActions;
    columnsLength: number;
    visibleMobileColumnsCount: number;
    isSmUp: boolean;
};

const BusinessExpenseDetails = ({
    row,
    columnsLength,
    visibleMobileColumnsCount,
    isSmUp,
}: DataTableDetailBusinessExpenseProps) => {
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
                        Payment Method
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.payment_method}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold"
                        style={cellLabelStyle}
                    >
                        Notes
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.notes}
                    </div>
                    <div
                        className="flex px-4 py-3 font-semibold items-center"
                        style={cellLabelStyle}
                    >
                        Attach Receipt
                    </div>
                    <div className="px-4 py-3" style={cellValueStyle}>
                        {row.attach_recipt && (
                            <img
                                src={
                                    typeof row.attach_recipt === "string"
                                        ? row.attach_recipt
                                        : ""
                                }
                                alt="Receipt"
                            />
                        )}
                    </div>
                </div>
            </td>
            <td></td>
        </>
    );
};

export default BusinessExpenseDetails;
