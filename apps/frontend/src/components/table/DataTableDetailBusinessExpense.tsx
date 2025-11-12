import type { BusinessExpenseWithActions } from "../../routes/_protected/expenses/business";
import { getFormattedDate } from "../../utils/dateFormatter";

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
    return (
        <>
            <td></td>
            <td
                colSpan={
                    isSmUp ? columnsLength - 1 : visibleMobileColumnsCount - 1
                }
                className="px-4 py-3"
            >
                {isSmUp && row.expense_type == "inventory_loss" ? (
                    <div className="grid grid-cols-5 gap-2">
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Lost Number
                            </div>
                            <div className="text-arvo-black-100">
                                {row.quantity} unit(s)
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Notes
                            </div>
                            <div className="text-arvo-black-100">
                                {row.notes}
                            </div>
                        </div>
                    </div>
                ) : !isSmUp && row.expense_type == "inventory_loss" ? (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="font-semibold">Category</div>
                        <div>
                            <span className="capitalize bg-arvo-orange-50 text-arvo-orange-100 rounded-xl px-2 py-1 whitespace-nowrap">
                                {row.expense_type.replace("_", " ")}
                            </span>
                        </div>

                        <div className="font-semibold">Date</div>
                        <div>{getFormattedDate(row.createdAt)}</div>

                        <div className="font-semibold">Note</div>
                        <div>{row.notes}</div>
                    </div>
                ) : isSmUp && row.expense_type != "inventory_loss" ? (
                    <div className="grid grid-cols-5 gap-2">
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Notes
                            </div>
                            <div className="text-arvo-black-100">
                                {row.notes}
                            </div>
                        </div>
                        <div className="flex flex-col px-2 py-1">
                            <div className="font-semibold text-sm text-arvo-black-50">
                                Attach Receipt
                            </div>
                            <div className="text-arvo-black-100">
                                {row.attach_recipt && (
                                    <img
                                        src={
                                            typeof row.attach_recipt ===
                                            "string"
                                                ? row.attach_recipt
                                                : ""
                                        }
                                    />
                                )}
                            </div>
                        </div>
                        {row.repeat_every && row.start_date && row.due_date && (
                            <>
                                <div className="flex flex-col px-2 py-1">
                                    <div className="font-semibold text-sm text-arvo-black-50">
                                        Repeat Every
                                    </div>
                                    <div className="text-arvo-black-100 capitalize">
                                        {row.repeat_every}
                                    </div>
                                </div>
                                <div className="flex flex-col px-2 py-1">
                                    <div className="font-semibold text-sm text-arvo-black-50">
                                        Start Date
                                    </div>
                                    <div className="text-arvo-black-100">
                                        {getFormattedDate(row.start_date)}
                                    </div>
                                </div>
                                <div className="flex flex-col px-2 py-1">
                                    <div className="font-semibold text-sm text-arvo-black-50">
                                        Due Date
                                    </div>
                                    <div className="text-arvo-black-100">
                                        {getFormattedDate(row.due_date)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="font-semibold">Category</div>
                        <div>
                            <span className="capitalize bg-arvo-blue-80 text-white rounded-xl px-2 py-1 whitespace-nowrap">
                                {row.expense_type.replace("_", " ")}
                            </span>
                        </div>

                        <div className="font-semibold">Payee</div>
                        <div>{row.payee}</div>

                        <div className="font-semibold">Payment Method</div>
                        <div>{row.payment_method}</div>

                        <div className="font-semibold">Date</div>
                        <div>{getFormattedDate(row.createdAt)}</div>

                        <div className="font-semibold">Note</div>
                        <div>{row.notes}</div>

                        {row.repeat_every && row.start_date && row.due_date && (
                            <>
                                <div className="font-semibold">
                                    Repeat Every
                                </div>
                                <div className="capitalize">
                                    {row.repeat_every}
                                </div>

                                <div className="font-semibold">Start Date</div>
                                <div>{getFormattedDate(row.start_date)}</div>

                                <div className="font-semibold">Due Date</div>
                                <div>{getFormattedDate(row.due_date)}</div>
                            </>
                        )}
                    </div>
                )}
            </td>
            <td></td>
        </>
    );
};

export default BusinessExpenseDetails;
