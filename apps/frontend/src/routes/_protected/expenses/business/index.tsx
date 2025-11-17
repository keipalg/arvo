import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { queryClient, trpc } from "../../../../utils/trpcClient";
import DataTable, {
    type FilterOption,
} from "../../../../components/table/DataTable";
import {
    operationalExpenseValidation,
    studioOverheadExpenseValidation,
} from "@arvo/shared";

import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../../../../components/button/Button";
import { useEffect, useState } from "react";
import RightDrawer from "../../../../components/drawer/RightDrawer";
import TextInput from "../../../../components/input/TextInput";
import Select from "../../../../components/input/Select";
import TextArea from "../../../../components/input/TextArea";
import { Switcher } from "../../../../components/button/Switcher";
import PageTitle from "../../../../components/layout/PageTitle";
import { MoreButton } from "../../../../components/button/MoreButton";
import { MoreButtonProvider } from "../../../../components/button/MoreButtonProvider";
import FormLabel from "../../../../components/input/FormLabel";
import { FileInput } from "../../../../components/input/FileInput";
import { uploadFile } from "../../../../utils/fileUpload";
import ConfirmationModal from "../../../../components/modal/ConfirmationModal";
import ToastNotification from "../../../../components/modal/ToastNotification";
import Metric from "../../../../components/metric/Metric";
import { useIsSmUp } from "../../../../utils/screenWidth";
import AddButton from "../../../../components/button/AddButton";
import BusinessExpenseDetails from "../../../../components/table/DataTableDetailBusinessExpense";
import NumberInput from "../../../../components/input/NumberInput";
import DatePicker from "../../../../components/input/DatePicker";
import { getDateForInputField } from "../../../../utils/dateFormatter";

export const Route = createFileRoute("/_protected/expenses/business/")({
    component: BusinessExpense,
});

type OperationalExpense =
    | "marketing"
    | "business_fee"
    | "utilities"
    | "office_supplies"
    | "studio_rent"
    | "labor"
    | "storage_fee"
    | "inventory_loss"
    | "miscellaneous";
type SalesExpense = "discount" | "shipping";
type OverheadExpense =
    | "space_rent"
    | "tools_equipment"
    | "packaging_supplies"
    | "miscellaneous";
type BusinessExpense = {
    id: string;
    expense_category: "Operational Expenses" | "Overhead Expenses";
    expense_type:
        | "marketing"
        | "business_fee"
        | "utilities"
        | "office_supplies"
        | "studio_rent"
        | "labor"
        | "storage_fee"
        | "inventory_loss"
        | "space_rent"
        | "tools_equipment"
        | "packaging_supplies"
        | "miscellaneous"
        | "discount"
        | "shipping";
    name: string;
    cost: number;
    payee: string;
    payment_method: "credit" | "cash";
    selectedInventoryLossOption: "goods_loss" | "materials_loss";
    selectedInventoryLossMaxQuantity: number;
    good_id: string | null;
    materialAndSupply_id: string | null;
    quantity: number;
    notes: string;
    attach_recipt: File | string | undefined;
    createdAt: Date;
    repeat_every:
        | "daily"
        | "weekly"
        | "bi-weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | null;
    start_date: Date | null;
    due_date: Date | null;
};
export type BusinessExpenseWithActions = BusinessExpense & { actions: string };

function BusinessExpense() {
    const OperationalExpenseList: OperationalExpense[] = [
        "marketing",
        "business_fee",
        "utilities",
        "office_supplies",
        "studio_rent",
        "labor",
        "storage_fee",
        "inventory_loss",
        "miscellaneous",
    ];
    const SalesExpenseList: SalesExpense[] = ["discount", "shipping"];
    const OverheadExpenseList: OverheadExpense[] = [
        "space_rent",
        "tools_equipment",
        "packaging_supplies",
        "miscellaneous",
    ];
    const isSmUp = useIsSmUp();
    const detailsRender = (row: BusinessExpenseWithActions) => {
        const defaultMobileSet = new Set<keyof BusinessExpenseWithActions>();
        if (columns[0]) defaultMobileSet.add(columns[0].key);
        if (columns[1]) defaultMobileSet.add(columns[1].key);
        const actionsCol = columns.find((c) => String(c.key) === "actions");
        if (actionsCol) defaultMobileSet.add(actionsCol.key);

        const mobileSet = new Set<keyof BusinessExpenseWithActions>(
            Array.from(defaultMobileSet),
        );

        const visibleMobileColumnsCount = columns.filter((c) =>
            mobileSet.has(c.key),
        ).length;

        return (
            <BusinessExpenseDetails
                row={row}
                columnsLength={columns.length}
                visibleMobileColumnsCount={visibleMobileColumnsCount}
                isSmUp={isSmUp}
            />
        );
    };
    const tableFilterOptions: FilterOption<BusinessExpenseWithActions>[] = [
        {
            key: "expense_type",
            label: "Operational Expense",
            values:
                OperationalExpenseList?.map((s) => ({
                    key: s,
                    label: s
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase()),
                })) ?? [],
        },
        {
            key: "expense_type",
            label: "Overhead Expense",
            values:
                OverheadExpenseList?.map((s) => ({
                    key: s,
                    label: s
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase()),
                })) ?? [],
        },
    ];

    const [totalExpensesThisMonth, setTotalExpensesThisMonth] = useState<
        Record<string, number | string> | undefined
    >(undefined);
    const initialBusinessExpense: BusinessExpense = {
        id: "",
        expense_category: "Operational Expenses",
        expense_type: "marketing",
        name: "",
        cost: 0,
        payee: "",
        payment_method: "credit",
        selectedInventoryLossOption: "goods_loss",
        selectedInventoryLossMaxQuantity: 0,
        good_id: "",
        materialAndSupply_id: "",
        quantity: 0,
        notes: "",
        attach_recipt: undefined,
        repeat_every: "monthly",
        createdAt: new Date(),
        start_date: new Date(),
        due_date: null,
    };

    const [businessExpenseFormData, setBusinessExpenseFormData] = useState(
        initialBusinessExpense,
    );
    console.log("businessExpenseFormData", businessExpenseFormData);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [toggleOpen, setToggleOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false);
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
    const [selectedItemForDeletion, setSelectedItemForDeletion] = useState<{
        id: string;
        expense_category: string;
        name: string;
    }>({ id: "", expense_category: "", name: "" });
    const [dueDateOptions, setDueDateOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [validationError, setValidationError] = useState<
        Record<string, string>
    >({});

    const { data: goodsList } = useQuery(trpc.goods.list.queryOptions());
    const { data: materialsList } = useQuery(
        trpc.materials.list.queryOptions(),
    );
    const {
        data: rowDataOperationalExpensesList,
        isLoading: isLoadingOperational,
        error: errorOperational,
    } = useQuery(trpc.operationalExpense.list.queryOptions());
    const operationalExpensesList = rowDataOperationalExpensesList
        ? rowDataOperationalExpensesList.map((item) => ({
              ...item,
              expense_category:
                  "Operational Expenses" as BusinessExpense["expense_category"],
          }))
        : [];
    const {
        data: rowDataStudioOverheadExpensesList,
        isLoading: isLoadingStudio,
        error: errorStudio,
    } = useQuery(trpc.studioOverheadExpense.list.queryOptions());
    const studioOverheadExpensesList = rowDataStudioOverheadExpensesList
        ? rowDataStudioOverheadExpensesList.map((item) => ({
              ...item,
              expense_category:
                  "Overhead Expenses" as BusinessExpense["expense_category"],
          }))
        : [];
    const combinedExpensesList = [
        ...(operationalExpensesList ?? []),
        ...(studioOverheadExpensesList ?? []),
    ].sort((a, b) => {
        const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
    console.log("combinedExpensesList", combinedExpensesList);

    useEffect(() => {
        if (!toggleOpen) {
            setDueDateOptions([]);
            console.log("dueDateOptions", []);
            return;
        }
        if (
            !businessExpenseFormData.start_date ||
            !businessExpenseFormData.repeat_every
        ) {
            setDueDateOptions([]);
            return;
        }

        const options: { label: string; value: string }[] = [];
        const start = new Date(businessExpenseFormData.start_date);

        for (let i = 1; i <= 12; i++) {
            const nextDate = new Date(start);

            switch (businessExpenseFormData.repeat_every) {
                case "daily":
                    nextDate.setDate(start.getDate() + i);
                    break;
                case "weekly":
                    nextDate.setDate(start.getDate() + i * 7);
                    break;
                case "bi-weekly":
                    nextDate.setDate(start.getDate() + i * 14);
                    break;
                case "monthly":
                    nextDate.setMonth(start.getMonth() + i);
                    break;
                case "quarterly":
                    nextDate.setMonth(start.getMonth() + i * 3);
                    break;
                case "yearly":
                    nextDate.setFullYear(start.getFullYear() + i);
                    break;
            }

            const formatted = nextDate.toISOString().substring(0, 10);
            options.push({ label: formatted, value: formatted });
        }

        setDueDateOptions(options);
        setBusinessExpenseFormData((prev) => {
            if (!prev.due_date) {
                return {
                    ...prev,
                    due_date: new Date(options[0].value),
                };
            }
            return prev;
        });

        console.log("dueDateOptions", options);
    }, [
        businessExpenseFormData.start_date,
        businessExpenseFormData.repeat_every,
        toggleOpen,
    ]);

    useEffect(() => {
        /*****
         * Calculate total business expense for current and previous month
         */
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonth = previousMonthDate.getMonth();
        const previousYear = previousMonthDate.getFullYear();

        const calcTotalBusinessExpenseByMonth = (year: number, month: number) =>
            combinedExpensesList?.reduce(
                (accumulator, currentValue) => {
                    const soldMonth = new Date(
                        currentValue.createdAt,
                    ).getMonth();
                    const soldYear = new Date(
                        currentValue.createdAt,
                    ).getFullYear();

                    const cost =
                        typeof currentValue.cost === "string"
                            ? parseFloat(currentValue.cost)
                            : currentValue.cost;

                    if (soldYear === year && soldMonth === month) {
                        accumulator[currentValue.name] =
                            (accumulator[currentValue.name] || 0) + cost;
                    }
                    return accumulator;
                },
                {} as Record<string, number>,
            );

        const totalCurrentByBusinessExpense = calcTotalBusinessExpenseByMonth(
            currentYear,
            currentMonth,
        );
        const totalPreviousByBusinessExpense = calcTotalBusinessExpenseByMonth(
            previousYear,
            previousMonth,
        );

        console.log("Total Current Month:", totalCurrentByBusinessExpense);
        console.log("Total Previous Month:", totalPreviousByBusinessExpense);

        /*****
         * Calculate top business expense and its change percent compared to previous month
         */
        const calcTopCurrentBusinessExpenseName = () => {
            if (!totalCurrentByBusinessExpense) return undefined;

            return Object.entries(totalCurrentByBusinessExpense).reduce(
                (max, [key, value]) =>
                    value > max.value ? { key, value } : max,
                { key: "", value: -Infinity },
            ).key;
        };

        const topCurrentName = calcTopCurrentBusinessExpenseName();
        console.log("Top Business Expense Name This Month:", topCurrentName);

        /*****
         * Calculate total business expense for current month and its change percent compared to previous month
         */
        const calculateTotalThisMonth = () => {
            if (!totalCurrentByBusinessExpense) return 0;

            return Object.values(totalCurrentByBusinessExpense).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
        };
        const calculatedTotalPreviousMonth = () => {
            if (!totalPreviousByBusinessExpense) return 0;

            return Object.values(totalPreviousByBusinessExpense).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
        };
        const totalThisMonth = calculateTotalThisMonth();
        const totalPreviousMonth = calculatedTotalPreviousMonth();
        console.log("Total Business Expense This Month:", totalThisMonth);
        console.log(
            "Total Business Expense Previous Month:",
            totalPreviousMonth,
        );

        const changePercentForTotal =
            totalPreviousMonth === 0
                ? totalThisMonth === 0
                    ? 0
                    : 100
                : ((totalThisMonth - totalPreviousMonth) / totalPreviousMonth) *
                  100;

        setTotalExpensesThisMonth({
            total: totalThisMonth,
            changePercent: changePercentForTotal,
        });
        console.log("totalExpensesThisMonth", totalExpensesThisMonth);
    }, [rowDataOperationalExpensesList, rowDataStudioOverheadExpensesList]);

    const closeDrawer = () => {
        setDrawerOpen(false);
        setBusinessExpenseFormData(initialBusinessExpense);
        setValidationError({});
    };

    const addOperationalExpenseMutation = useMutation(
        trpc.operationalExpense.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.operationalExpense.list.queryKey(),
                });
                closeDrawer();
                setToastMessage({
                    kind: "SUCCESS",
                    content: `Success! ${businessExpenseFormData.name} has been added.`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error adding expense: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const updateOperationalExpenseMutation = useMutation(
        trpc.operationalExpense.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.operationalExpense.list.queryKey(),
                });
                closeDrawer();
                setToastMessage({
                    kind: "SUCCESS",
                    content: `${businessExpenseFormData.name} updated successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error updating expense: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const deleteOperationalExpenseMutation = useMutation(
        trpc.operationalExpense.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.operationalExpense.list.queryKey(),
                });
                setToastMessage({
                    kind: "SUCCESS",
                    content: `${selectedItemForDeletion.name} deleted successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error deleting expense: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const addStudioOverheadExpenseMutation = useMutation(
        trpc.studioOverheadExpense.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.studioOverheadExpense.list.queryKey(),
                });
                closeDrawer();
                setToastMessage({
                    kind: "SUCCESS",
                    content: `${businessExpenseFormData.name} updated successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error adding expense: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const updateStudioOverheadExpenseMutation = useMutation(
        trpc.studioOverheadExpense.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.studioOverheadExpense.list.queryKey(),
                });
                closeDrawer();
                setToastMessage({
                    kind: "SUCCESS",
                    content: `${businessExpenseFormData.name} updated successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error updating expense: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const deleteStudioOverheadExpenseMutation = useMutation(
        trpc.studioOverheadExpense.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.studioOverheadExpense.list.queryKey(),
                });
                setToastMessage({
                    kind: "SUCCESS",
                    content: `${selectedItemForDeletion.name} deleted successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error deleting expense: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let receiptImageURL: string | undefined = undefined;
        if (businessExpenseFormData.attach_recipt instanceof File) {
            receiptImageURL = await uploadFile(
                businessExpenseFormData.attach_recipt,
            );
        } else if (typeof businessExpenseFormData.attach_recipt === "string") {
            receiptImageURL = businessExpenseFormData.attach_recipt;
        }

        // Operational Expense
        if (
            businessExpenseFormData.expense_category === "Operational Expenses"
        ) {
            const normalizedBusinessExpenseFormData =
                businessExpenseFormData.expense_type === "inventory_loss"
                    ? {
                          expense_type: businessExpenseFormData.expense_type,
                          name: businessExpenseFormData.name,
                          cost: businessExpenseFormData.cost,
                          payee: businessExpenseFormData.payee,
                          payment_method:
                              businessExpenseFormData.payment_method,
                          good_id:
                              businessExpenseFormData.good_id === ""
                                  ? null
                                  : businessExpenseFormData.good_id,
                          materialAndSupply_id:
                              businessExpenseFormData.materialAndSupply_id ===
                              ""
                                  ? null
                                  : businessExpenseFormData.materialAndSupply_id,
                          quantity: businessExpenseFormData.quantity,
                          notes: businessExpenseFormData.notes,
                          attach_recipt: receiptImageURL || "",
                          createdAt: businessExpenseFormData.createdAt,
                          repeat_every: businessExpenseFormData.repeat_every,
                          start_date: null,
                          due_date: null,
                      }
                    : {
                          expense_type: businessExpenseFormData.expense_type,
                          name: businessExpenseFormData.name,
                          cost: businessExpenseFormData.cost,
                          payee: businessExpenseFormData.payee,
                          payment_method:
                              businessExpenseFormData.payment_method,
                          good_id: null,
                          materialAndSupply_id: null,
                          quantity: 0,
                          notes: businessExpenseFormData.notes,
                          attach_recipt: receiptImageURL || "",
                          createdAt: businessExpenseFormData.createdAt,
                          repeat_every: businessExpenseFormData.repeat_every,
                          start_date: businessExpenseFormData.start_date,
                          due_date: businessExpenseFormData.due_date,
                      };

            const result = operationalExpenseValidation.safeParse(
                normalizedBusinessExpenseFormData,
            );

            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                console.log("errors", errors);
                setValidationError(errors);
                return;
            }

            if (businessExpenseFormData.id) {
                updateOperationalExpenseMutation.mutate({
                    id: businessExpenseFormData.id,
                    ...result.data,
                });
            } else {
                addOperationalExpenseMutation.mutate(result.data);
            }
            setValidationError({});

            // Studio Overhead Expense
        } else {
            const normalizedBusinessExpenseFormData = {
                expense_type: businessExpenseFormData.expense_type,
                name: businessExpenseFormData.name,
                cost: businessExpenseFormData.cost,
                payee: businessExpenseFormData.payee,
                payment_method: businessExpenseFormData.payment_method,
                notes: businessExpenseFormData.notes,
                attach_recipt: receiptImageURL || "",
                createdAt: businessExpenseFormData.createdAt,
                repeat_every: businessExpenseFormData.repeat_every,
                start_date: businessExpenseFormData.start_date,
                due_date: businessExpenseFormData.due_date,
            };

            const result = studioOverheadExpenseValidation.safeParse(
                normalizedBusinessExpenseFormData,
            );

            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                console.log("errors", errors);
                setValidationError(errors);
                return;
            }

            setValidationError({});
            if (businessExpenseFormData.id) {
                updateStudioOverheadExpenseMutation.mutate({
                    id: businessExpenseFormData.id,
                    ...result.data,
                });
            } else {
                addStudioOverheadExpenseMutation.mutate(result.data);
            }
        }
    };

    const handleDelete = (expense_category: string, id: string) => {
        if (
            expense_category ===
            ("Operational Expenses" as BusinessExpense["expense_category"])
        ) {
            deleteOperationalExpenseMutation.mutate({ id });
        } else {
            deleteStudioOverheadExpenseMutation.mutate({ id });
        }
    };

    const columns: Array<{
        key: keyof BusinessExpenseWithActions;
        header: string;
        render?: (
            value: BusinessExpenseWithActions[keyof BusinessExpenseWithActions],
            row: BusinessExpenseWithActions,
        ) => React.ReactNode;
    }> = [
        {
            key: "name",
            header: "Expense",
            render: (value, row) => {
                if (typeof value !== "string") return <span>-</span>;
                return (
                    <div className="flex items-center justify-between gap-2">
                        <span>{value}</span>
                        {row.repeat_every && row.start_date && row.due_date && (
                            <span className="w-5 h-5">
                                <img src="/icon/recurring.svg" />
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "cost",
            header: "Cost",
            render: (value) => {
                const num =
                    typeof value === "number"
                        ? value
                        : typeof value === "string"
                          ? parseFloat(value) || 0
                          : 0;

                return <span>${num.toFixed(2)}</span>;
            },
        },
        {
            key: "expense_type",
            header: "Category",
            render: (value) => {
                if (!value) return <span>-</span>;
                const highlightValues = [
                    "marketing",
                    "business_fee",
                    "utilities",
                    "office_supplies",
                    "studio_rent",
                    "space_rent",
                    "labor",
                    "storage_fee",
                    "inventory_loss",
                ];
                const str =
                    typeof value === "string" || typeof value === "number"
                        ? String(value)
                        : "";

                if (!str) return <span>-</span>;

                return highlightValues.includes(str) ? (
                    <span className="capitalize bg-arvo-blue-80 text-white rounded-xl px-2 py-1 whitespace-nowrap">
                        {str.replace("_", " ")}
                    </span>
                ) : (
                    <span className="capitalize bg-arvo-orange-50 text-arvo-orange-100 rounded-xl px-2 py-1 whitespace-nowrap">
                        {str.replace("_", " ")}
                    </span>
                );
            },
        },
        {
            key: "createdAt",
            header: "Date",
            render: (value) => {
                if (!value) return <>-</>;
                let d: Date;

                if (value instanceof Date) {
                    d = value;
                } else if (
                    typeof value === "string" ||
                    typeof value === "number"
                ) {
                    d = new Date(value);
                } else {
                    return <>-</>;
                }
                return isNaN(d.getTime()) ? (
                    <>-</>
                ) : (
                    <span className="whitespace-nowrap">
                        {d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                );
            },
        },
        {
            key: "payee",
            header: "Payee",
        },
        {
            key: "actions",
            header: "Actions",
            render: (_value, row) => {
                return (
                    <>
                        {SalesExpenseList.includes(
                            row.expense_type as SalesExpense,
                        ) ? (
                            <></>
                        ) : (
                            <MoreButton
                                id={row.id}
                                onEdit={() => {
                                    setBusinessExpenseFormData({
                                        ...row,
                                        selectedInventoryLossOption: row.good_id
                                            ? "goods_loss"
                                            : "materials_loss",
                                        attach_recipt:
                                            row.attach_recipt === ""
                                                ? undefined
                                                : row.attach_recipt,
                                        cost: Number(row.cost),
                                    });
                                    setDrawerOpen(true);
                                    setSelectedItemForDeletion({
                                        id: row.id,
                                        name: row.name,
                                        expense_category: row.expense_category,
                                    });
                                    if (
                                        row.due_date &&
                                        row.start_date &&
                                        row.repeat_every
                                    ) {
                                        setToggleOpen(true);
                                    } else {
                                        setToggleOpen(false);
                                    }
                                }}
                                onDeleteModal={() => {
                                    setIsConfirmationModalOpen(true);
                                    setSelectedItemForDeletion({
                                        expense_category: row.expense_category,
                                        id: row.id,
                                        name: row.name,
                                    });
                                }}
                            />
                        )}
                    </>
                );
            },
        },
    ];

    const tabledData: BusinessExpenseWithActions[] = (
        combinedExpensesList ?? []
    ).map((element) => ({
        ...(element as unknown as BusinessExpenseWithActions),
        actions: "",
    }));

    return (
        <BaseLayout title="Business Expenses List">
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
            <ConfirmationModal
                confirmationMessage={`Are you sure you want to delete "${selectedItemForDeletion.name}"?`}
                isConfirmationModalOpen={isConfirmationModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                onConfirm={() => {
                    handleDelete(
                        selectedItemForDeletion.expense_category,
                        selectedItemForDeletion.id,
                    );
                    setSelectedItemForDeletion({
                        id: "",
                        expense_category: "",
                        name: "",
                    });
                    setDrawerOpen(false);
                }}
            />
            <div className="flex justify-between">
                <PageTitle
                    title="Business Expense"
                    info="Business Expense is where you log costs that keep your business running."
                />
                <AddButton
                    value="Add New Expense"
                    onClick={() => {
                        setToggleOpen(false);
                        setBusinessExpenseFormData(initialBusinessExpense);
                        setDrawerOpen(true);
                    }}
                    icon="/icon/plus.svg"
                ></AddButton>
            </div>
            <div className="flex gap-6 py-2 overflow-x-auto">
                <Metric
                    value={`${totalExpensesThisMonth?.total ? `$${Number(totalExpensesThisMonth.total).toFixed(2)}` : "-"}`}
                    changePercent={
                        totalExpensesThisMonth?.changePercent != null
                            ? Math.round(
                                  Number(totalExpensesThisMonth.changePercent),
                              )
                            : 0
                    }
                    topText="Monthly Business Expense"
                    bottomText="compared to last month"
                    colorVariant={
                        totalExpensesThisMonth?.changePercent != null &&
                        Number(totalExpensesThisMonth.changePercent) < 0
                            ? "positive"
                            : "negative"
                    }
                />
            </div>
            {isLoadingOperational && isLoadingStudio && <div>Loading...</div>}
            {errorOperational && errorStudio && (
                <div>Error: {errorOperational.message}</div>
            )}
            {!errorStudio && !errorOperational && tabledData && (
                <MoreButtonProvider>
                    <DataTable<BusinessExpenseWithActions>
                        columns={columns}
                        data={tabledData}
                        detailRender={detailsRender}
                        mobileVisibleKeys={["name", "cost", "actions"]}
                        sortOptions={[
                            {
                                key: "createdAt",
                                label: "Date (Newest → Oldest)",
                                order: "desc",
                            },
                            {
                                key: "createdAt",
                                label: "Date (Oldest → Newest)",
                                order: "asc",
                            },
                            {
                                key: "name",
                                label: "Name (A → Z)",
                                order: "asc",
                            },
                            {
                                key: "name",
                                label: "Name (Z → A)",
                                order: "desc",
                            },
                            {
                                key: "cost",
                                label: "Cost (High → Low)",
                                order: "desc",
                            },
                            {
                                key: "cost",
                                label: "Cost (Low → High)",
                                order: "asc",
                            },
                        ]}
                        filterOptions={tableFilterOptions}
                        searchOption={{
                            key: "name",
                            label: "Expense Name",
                        }}
                    />
                </MoreButtonProvider>
            )}

            <RightDrawer
                narrower={true}
                isOpen={drawerOpen}
                onClose={() => closeDrawer()}
            >
                <h3 className="text-2xl">Add New Expense</h3>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <DatePicker
                        label="Date*"
                        name="createdAt"
                        value={getDateForInputField(
                            businessExpenseFormData.createdAt,
                        )}
                        onChange={(value) => {
                            setBusinessExpenseFormData((prev) => ({
                                ...prev,
                                createdAt: new Date(value),
                            }));
                        }}
                        error={validationError.createdAt}
                        placeholder="Select date"
                    />
                    <Select
                        name="expense_type"
                        label="Expense Type*"
                        value={businessExpenseFormData.expense_type}
                        onChange={(e) => {
                            setBusinessExpenseFormData(
                                (prev) =>
                                    ({
                                        ...prev,
                                        expense_category:
                                            e.target.options[
                                                e.target.selectedIndex
                                            ].dataset.expensecategory,
                                        expense_type: e.target.value,
                                    }) as BusinessExpense,
                            );
                        }}
                        optgroup={[
                            {
                                optGroupLabel: "Operational Expenses",
                                optGroupValues: [
                                    { label: "Marketing", value: "marketing" },
                                    {
                                        label: "Business Fee",
                                        value: "business_fee",
                                    },
                                    { label: "Utilities", value: "utilities" },
                                    {
                                        label: "Office Supplies",
                                        value: "office_supplies",
                                    },
                                    {
                                        label: "Studio Rent",
                                        value: "studio_rent",
                                    },
                                    { label: "Labor", value: "labor" },
                                    {
                                        label: "Storage Fee",
                                        value: "storage_fee",
                                    },
                                    {
                                        label: "Inventory Loss",
                                        value: "inventory_loss",
                                    },
                                    {
                                        label: "Miscellaneous",
                                        value: "miscellaneous",
                                    },
                                ],
                            },
                            {
                                optGroupLabel: "Overhead Expenses",
                                optGroupValues: [
                                    {
                                        label: "Space Rent",
                                        value: "space_rent",
                                    },
                                    {
                                        label: "Tools & Equipment",
                                        value: "tools_equipment",
                                    },
                                    {
                                        label: "Packaging Supplies",
                                        value: "packaging_supplies",
                                    },
                                    {
                                        label: "Miscellaneous",
                                        value: "miscellaneous",
                                    },
                                ],
                            },
                        ]}
                    />
                    {businessExpenseFormData.expense_type ==
                    "inventory_loss" ? (
                        <>
                            <div className="flex flex-col">
                                <FormLabel label="Inventory Loss" />
                                <div className="flex gap-5">
                                    <label
                                        htmlFor="inventory_loss_option_goods_loss"
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            id="inventory_loss_option_goods_loss"
                                            type="radio"
                                            name="inventory_loss_option"
                                            value="goods_loss"
                                            checked={
                                                businessExpenseFormData.selectedInventoryLossOption ===
                                                "goods_loss"
                                            }
                                            onChange={() => {
                                                setBusinessExpenseFormData(
                                                    (prev) => ({
                                                        ...prev,
                                                        selectedInventoryLossOption:
                                                            "goods_loss",
                                                        materialAndSupply_id:
                                                            "",
                                                        quantity: 0,
                                                    }),
                                                );
                                            }}
                                        />
                                        <span>Goods Loss</span>
                                    </label>
                                    <label
                                        htmlFor="inventory_loss_option_materials_loss"
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            id="inventory_loss_option_materials_loss"
                                            type="radio"
                                            name="inventory_loss_option"
                                            value="materials_loss"
                                            checked={
                                                businessExpenseFormData.selectedInventoryLossOption ===
                                                "materials_loss"
                                            }
                                            onChange={() => {
                                                setBusinessExpenseFormData(
                                                    (prev) => ({
                                                        ...prev,
                                                        selectedInventoryLossOption:
                                                            "materials_loss",
                                                        good_id: "",
                                                        quantity: 0,
                                                    }),
                                                );
                                            }}
                                        />
                                        <span>Materials Loss</span>
                                    </label>
                                </div>
                            </div>
                            {businessExpenseFormData.selectedInventoryLossOption ===
                            "goods_loss" ? (
                                <Select
                                    name="goods"
                                    label="Goods"
                                    value={
                                        businessExpenseFormData.good_id ?? ""
                                    }
                                    error={validationError.good_id}
                                    onChange={(e) => {
                                        const selectedGoods = goodsList?.find(
                                            (goods) =>
                                                goods.id === e.target.value,
                                        );

                                        setBusinessExpenseFormData((prev) => ({
                                            ...prev,
                                            selectedInventoryLossOption:
                                                "goods_loss",
                                            quantity: 0,
                                            good_id: e.target.value,
                                            selectedInventoryLossMaxQuantity:
                                                selectedGoods?.inventoryQuantity ||
                                                0,
                                            materialAndSupply_id: "",
                                            name:
                                                goodsList?.find(
                                                    (goods) =>
                                                        goods.id ===
                                                        e.target.value,
                                                )?.name || prev.name,
                                        }));
                                    }}
                                    options={
                                        goodsList
                                            ?.map((goods) => {
                                                return {
                                                    label: goods.name,
                                                    value: goods.id,
                                                };
                                            })
                                            .concat({
                                                label: "-- Select Goods --",
                                                value: "",
                                            }) ?? []
                                    }
                                />
                            ) : (
                                <Select
                                    name="materials"
                                    label="Materials"
                                    value={
                                        businessExpenseFormData.materialAndSupply_id ??
                                        ""
                                    }
                                    error={validationError.materialAndSupply_id}
                                    onChange={(e) => {
                                        const selectedMaterial =
                                            materialsList?.find(
                                                (materials) =>
                                                    materials.id ===
                                                    e.target.value,
                                            );

                                        setBusinessExpenseFormData((prev) => ({
                                            ...prev,
                                            selectedInventoryLossOption:
                                                "materials_loss",
                                            quantity: 0,
                                            materialAndSupply_id:
                                                e.target.value,
                                            good_id: "",
                                            selectedInventoryLossMaxQuantity:
                                                selectedMaterial?.quantity || 0,
                                            cost: selectedMaterial?.costPerUnit
                                                ? selectedMaterial.costPerUnit *
                                                  prev.quantity
                                                : prev.cost,
                                            name:
                                                selectedMaterial?.name ||
                                                prev.name,
                                        }));
                                    }}
                                    options={
                                        materialsList
                                            ?.map((materials) => {
                                                return {
                                                    label: materials.name,
                                                    value: materials.id,
                                                };
                                            })
                                            .concat({
                                                label: "-- Select Material --",
                                                value: "",
                                            }) ?? []
                                    }
                                />
                            )}
                            <NumberInput
                                label="Quantity"
                                value={businessExpenseFormData.quantity}
                                step={
                                    businessExpenseFormData.selectedInventoryLossOption ===
                                    "goods_loss"
                                        ? "1"
                                        : "0.01"
                                }
                                min="0"
                                max={String(
                                    businessExpenseFormData.selectedInventoryLossMaxQuantity <
                                        0
                                        ? 0
                                        : businessExpenseFormData.selectedInventoryLossMaxQuantity,
                                )}
                                error={validationError.quantity}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    const newQuantity = parseFloat(
                                        e.target.value,
                                    );
                                    setBusinessExpenseFormData((prev) => {
                                        if (prev.materialAndSupply_id) {
                                            const selectedMaterial =
                                                materialsList?.find(
                                                    (m) =>
                                                        m.id ===
                                                        prev.materialAndSupply_id,
                                                );
                                            return {
                                                ...prev,
                                                quantity: newQuantity,
                                                cost: selectedMaterial?.costPerUnit
                                                    ? selectedMaterial.costPerUnit *
                                                      newQuantity
                                                    : prev.cost,
                                            };
                                        } else if (prev.good_id) {
                                            const selectedGoods =
                                                goodsList?.find(
                                                    (g) =>
                                                        g.id === prev.good_id,
                                                );
                                            return {
                                                ...structuredClone(prev),
                                                quantity: newQuantity,
                                                cost: selectedGoods?.materialCost
                                                    ? selectedGoods.materialCost *
                                                      newQuantity
                                                    : prev.cost,
                                            };
                                        } else {
                                            return {
                                                ...prev,
                                                quantity: newQuantity,
                                            };
                                        }
                                    });
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <TextInput
                                type="text"
                                label="Name*"
                                name="name"
                                value={businessExpenseFormData.name}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }));
                                }}
                                error={validationError.name}
                            />
                            <TextInput
                                type="number"
                                label="Cost*"
                                name="cost"
                                value={businessExpenseFormData.cost}
                                step="0.01"
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...prev,
                                        cost: parseFloat(e.target.value),
                                    }));
                                }}
                                error={validationError.cost}
                            />
                            <TextInput
                                label="Payee*"
                                name="payee"
                                value={businessExpenseFormData.payee}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...prev,
                                        payee: e.target.value,
                                    }));
                                }}
                                error={validationError.payee}
                            />
                            <Select
                                name="payment_method"
                                label="Payment Method"
                                value={businessExpenseFormData.payment_method}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...prev,
                                        payment_method: e.target
                                            .value as typeof businessExpenseFormData.payment_method,
                                    }));
                                }}
                                options={[
                                    { label: "Credit", value: "credit" },
                                    { label: "Cash", value: "cash" },
                                ]}
                            />
                            <FileInput
                                label="Attach Receipt"
                                file={businessExpenseFormData.attach_recipt}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...prev,
                                        attach_recipt:
                                            e.target.files?.[0] ?? undefined,
                                    }));
                                }}
                            />
                        </>
                    )}
                    <TextArea
                        name="notes"
                        label="Notes"
                        value={businessExpenseFormData.notes}
                        onChange={(e) => {
                            setBusinessExpenseFormData((prev) => ({
                                ...prev,
                                notes: e.target.value,
                            }));
                        }}
                    />
                    <div className="mt-4">
                        {businessExpenseFormData.expense_type !=
                            "inventory_loss" && (
                            <Switcher
                                label="Make this a recurring expense?"
                                checked={toggleOpen}
                                onChange={() => {
                                    setToggleOpen((prev) => !prev);
                                    setBusinessExpenseFormData((prev) => ({
                                        ...prev,
                                        due_date: null,
                                    }));
                                }}
                            >
                                <>
                                    <Select
                                        name="repeat_every"
                                        label="Repeat Every"
                                        value={
                                            businessExpenseFormData.repeat_every ||
                                            ""
                                        }
                                        onChange={(e) => {
                                            setBusinessExpenseFormData(
                                                (prev) => ({
                                                    ...prev,
                                                    repeat_every: e.target
                                                        .value as BusinessExpense["repeat_every"],
                                                }),
                                            );
                                        }}
                                        options={[
                                            { label: "Daily", value: "daily" },
                                            {
                                                label: "Weekly",
                                                value: "weekly",
                                            },
                                            {
                                                label: "Bi-Weekly",
                                                value: "bi-weekly",
                                            },
                                            {
                                                label: "Monthly",
                                                value: "monthly",
                                            },
                                            {
                                                label: "Quarterly",
                                                value: "quarterly",
                                            },
                                            {
                                                label: "Yearly",
                                                value: "yearly",
                                            },
                                        ]}
                                    />
                                    <TextInput
                                        type="date"
                                        label="Start Date"
                                        value={
                                            businessExpenseFormData.start_date
                                                ? businessExpenseFormData.start_date
                                                      .toISOString()
                                                      .substring(0, 10)
                                                : ""
                                        }
                                        onChange={(e) => {
                                            setBusinessExpenseFormData(
                                                (prev) => ({
                                                    ...prev,
                                                    start_date: new Date(
                                                        e.target.value,
                                                    ),
                                                }),
                                            );
                                        }}
                                    />
                                    <Select
                                        name="due_date"
                                        label="Due Date"
                                        value={
                                            businessExpenseFormData.due_date
                                                ? businessExpenseFormData.due_date
                                                      .toISOString()
                                                      .substring(0, 10)
                                                : ""
                                        }
                                        onChange={(e) => {
                                            setBusinessExpenseFormData(
                                                (prev) => ({
                                                    ...prev,
                                                    due_date: new Date(
                                                        e.target.value,
                                                    ),
                                                }),
                                            );
                                        }}
                                        options={dueDateOptions}
                                    />
                                </>
                            </Switcher>
                        )}
                    </div>
                    <div
                        className={`mt-4 grid ${selectedItemForDeletion.id !== "" && "grid-cols-2 gap-2"}`}
                    >
                        {selectedItemForDeletion.id && (
                            <Button
                                type="button"
                                value="Delete"
                                onClick={() => {
                                    setIsConfirmationModalOpen(true);
                                }}
                            ></Button>
                        )}
                        <Button type="submit" value="Save"></Button>
                    </div>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
