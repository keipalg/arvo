import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { queryClient, trpc } from "../../../../utils/trpcClient";
import DataTable from "../../../../components/table/DataTable";
import { operationalExpenseValidation } from "shared/validation/operationalExpenseValidation";
import { studioOverheadExpenseValidation } from "shared/validation/studioOverheadExpenseValidation";

import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../../../../components/button/Button";
import { useState } from "react";
import RightDrawer from "../../../../components/drawer/RightDrawer";
import { DateInput } from "../../../../components/input/DateInput";
import TextInput from "../../../../components/input/TextInput";
import Select from "../../../../components/input/Select";
import TextArea from "../../../../components/input/TextArea";
import { Switcher } from "../../../../components/button/Switcher";

export const Route = createFileRoute("/_protected/expenses/business/")({
    component: BusinessExpense,
});

type BusinessExpense = {
    id: string | number;
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
        | "tools_equipment"
        | "packaging_supplies"
        | "miscellaneous";
    name: string;
    cost: number;
    payee: string;
    payment_method: "credit" | "cash";
    good_id: string | null;
    materialAndSupply_id: string | null;
    quantity: number;
    notes: string;
    attach_recipt: string;
    createdAt: Date;
    start_date: Date | null;
    due_date: Date | null;
};
type BusinessExpenseWithActions = BusinessExpense & { actions: string };

function BusinessExpense() {
    const initialBusinessExpense: BusinessExpense = {
        id: "",
        expense_category: "Operational Expenses",
        expense_type: "marketing",
        name: "",
        cost: 0,
        payee: "",
        payment_method: "credit",
        good_id: "",
        materialAndSupply_id: "",
        quantity: 0,
        notes: "",
        attach_recipt: "",
        createdAt: new Date(),
        start_date: null,
        due_date: null,
    };

    const [businessExpenseFormData, setBusinessExpenseFormData] = useState(
        initialBusinessExpense,
    );

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [validationError, setValidationError] = useState<
        Record<string, string>
    >({});

    const { data: goodsList } = useQuery(trpc.goods.list.queryOptions());
    const { data: materialsList } = useQuery(
        trpc.materials.list.queryOptions(),
    );
    const {
        data: operationalExpensesList,
        isLoading: isLoadingOperational,
        error: errorOperational,
    } = useQuery(trpc.operationalExpense.list.queryOptions());
    const {
        data: studioOverheadExpensesList,
        isLoading: isLoadingStudio,
        error: errorStudio,
    } = useQuery(trpc.studioOverheadExpense.list.queryOptions());
    const combinedExpensesList = [
        ...(operationalExpensesList ?? []),
        ...(studioOverheadExpensesList ?? []),
    ];

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
            },
        }),
    );

    const addStudioOverheadExpenseMutation = useMutation(
        trpc.studioOverheadExpense.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.studioOverheadExpense.list.queryKey(),
                });
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
                          attach_recipt: businessExpenseFormData.attach_recipt,
                          createdAt: new Date(),
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
                          attach_recipt: businessExpenseFormData.attach_recipt,
                          createdAt: new Date(),
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

            setValidationError({});
            addOperationalExpenseMutation.mutate(result.data);
        } else {
            const normalizedBusinessExpenseFormData = {
                expense_type: businessExpenseFormData.expense_type,
                name: businessExpenseFormData.name,
                cost: businessExpenseFormData.cost,
                payee: businessExpenseFormData.payee,
                payment_method: businessExpenseFormData.payment_method,
                notes: businessExpenseFormData.notes,
                attach_recipt: businessExpenseFormData.attach_recipt,
                createdAt: new Date(),
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
            addStudioOverheadExpenseMutation.mutate(result.data);
        }
    };

    const columns: Array<{
        key: keyof BusinessExpenseWithActions;
        header: string;
        render?: (
            value: BusinessExpenseWithActions[keyof BusinessExpenseWithActions],
        ) => React.ReactNode;
    }> = [
        {
            key: "name",
            header: "Expnse",
        },
        {
            key: "cost",
            header: "Cost",
            render: (value) => {
                const num =
                    typeof value === "number"
                        ? value
                        : parseFloat(String(value ?? "0")) || 0;
                return <span>${num.toFixed(2)}</span>;
            },
        },
        {
            key: "expense_type",
            header: "Category",
            render: (value) => {
                if (!value) return <span>-</span>;
                const s = String(value);
                return (
                    <span className="capitalize">{s.replace("_", " ")}</span>
                );
            },
        },
        {
            key: "createdAt",
            header: "Date",
            render: (value) => {
                if (!value) return <>-</>;
                const d =
                    value instanceof Date ? value : new Date(String(value));
                return isNaN(d.getTime()) ? (
                    <>-</>
                ) : (
                    <>{d.toLocaleDateString()}</>
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
            render: () => (
                <>
                    <div className="flex gap-2">
                        <button className="text-blue-400 hover:underline">
                            Edit
                        </button>
                        <button className="text-blue-400 hover:underline">
                            Delete
                        </button>
                    </div>
                </>
            ),
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
            <div>
                <h3 className="">Business Expenses List</h3>
                <Button
                    value="Add"
                    onClick={() => setDrawerOpen(true)}
                ></Button>
            </div>
            {isLoadingOperational && isLoadingStudio && <div>Loading...</div>}
            {errorOperational && errorStudio && (
                <div>Error: {errorOperational.message}</div>
            )}
            {!errorStudio && !errorOperational && tabledData && (
                <DataTable<BusinessExpenseWithActions>
                    columns={columns}
                    data={tabledData}
                />
            )}

            <RightDrawer isOpen={drawerOpen} onClose={() => closeDrawer()}>
                <h3 className="text-2xl">Add New Operational Expense</h3>
                <form
                    onSubmit={(e) => {
                        handleSubmit(e);
                    }}
                >
                    <DateInput
                        label="Date"
                        value={
                            businessExpenseFormData.createdAt
                                .toISOString()
                                .split("T")[0]
                        }
                        onChange={(e) => {
                            setBusinessExpenseFormData((prev) => ({
                                ...structuredClone(prev),
                                createdAt: new Date(e.target.value),
                            }));
                        }}
                    />
                    <Select
                        name="expense_type"
                        label="Expense Type"
                        value={businessExpenseFormData.expense_type}
                        onChange={(e) => {
                            setBusinessExpenseFormData(
                                (prev) =>
                                    ({
                                        ...structuredClone(prev),
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
                            <Select
                                name="goods"
                                label="Goods"
                                value={businessExpenseFormData.good_id ?? ""}
                                error={validationError.good_id}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...structuredClone(prev),
                                        good_id: e.target.value,
                                        materialAndSupply_id: "",
                                        name:
                                            goodsList?.find(
                                                (goods) =>
                                                    goods.id === e.target.value,
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
                                                materials.id === e.target.value,
                                        );

                                    setBusinessExpenseFormData((prev) => ({
                                        ...structuredClone(prev),
                                        materialAndSupply_id: e.target.value,
                                        good_id: "",
                                        // Use prev.quantity (latest state inside updater) so we
                                        // don't read a stale value from the outer scope.
                                        cost: selectedMaterial?.costPerUnit
                                            ? selectedMaterial.costPerUnit *
                                              prev.quantity
                                            : prev.cost,
                                        name:
                                            selectedMaterial?.name || prev.name,
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
                            <TextInput
                                type="number"
                                label="Quantity"
                                name="quantity"
                                value={businessExpenseFormData.quantity}
                                onChange={(e) => {
                                    const newQuantity = parseFloat(
                                        e.target.value,
                                    );
                                    setBusinessExpenseFormData((prev) => {
                                        // If a material is selected, recalc cost using its costPerUnit
                                        const selectedMaterial =
                                            materialsList?.find(
                                                (m) =>
                                                    m.id ===
                                                    prev.materialAndSupply_id,
                                            );
                                        return {
                                            ...structuredClone(prev),
                                            quantity: newQuantity,
                                            cost: selectedMaterial?.costPerUnit
                                                ? selectedMaterial.costPerUnit *
                                                  newQuantity
                                                : prev.cost,
                                        };
                                    });
                                }}
                                error={validationError.quantity}
                            />
                        </>
                    ) : (
                        <>
                            <TextInput
                                type="text"
                                label="Name"
                                name="name"
                                value={businessExpenseFormData.name}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...structuredClone(prev),
                                        name: e.target.value,
                                    }));
                                }}
                                error={validationError.name}
                            />
                            <TextInput
                                type="number"
                                label="Cost"
                                name="cost"
                                value={businessExpenseFormData.cost}
                                step="0.01"
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...structuredClone(prev),
                                        cost: parseFloat(e.target.value),
                                    }));
                                }}
                                error={validationError.cost}
                            />
                            <TextInput
                                label="Payee"
                                name="payee"
                                value={businessExpenseFormData.payee}
                                onChange={(e) => {
                                    setBusinessExpenseFormData((prev) => ({
                                        ...structuredClone(prev),
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
                                        ...structuredClone(prev),
                                        payment_method: e.target
                                            .value as typeof businessExpenseFormData.payment_method,
                                    }));
                                }}
                                options={[
                                    { label: "Credit", value: "credit" },
                                    { label: "Cash", value: "cash" },
                                ]}
                            />
                        </>
                    )}
                    <TextArea
                        name="notes"
                        label="Notes"
                        value={businessExpenseFormData.notes}
                        onChange={(e) => {
                            setBusinessExpenseFormData((prev) => ({
                                ...structuredClone(prev),
                                notes: e.target.value,
                            }));
                        }}
                    />
                    {/* <FileInput
						label="Attach Receipt"
						file={operationalExpenseFormData.attach_recipt}
						onChange={(e) => {
							setOperationalExpenseFormData((prev) => ({
								...structuredClone(prev),
								attach_recipt: e.target.files?.[0],
							}))
						}} /> */}
                    {businessExpenseFormData.expense_type !=
                        "inventory_loss" && (
                        <Switcher label="Make this a recurring expense?">
                            <>
                                <DateInput
                                    label="Start Date"
                                    value={
                                        businessExpenseFormData.start_date
                                            ?.toISOString()
                                            .split("T")[0] || ""
                                    }
                                    onChange={(e) => {
                                        setBusinessExpenseFormData((prev) => ({
                                            ...structuredClone(prev),
                                            start_date: new Date(
                                                e.target.value,
                                            ),
                                        }));
                                    }}
                                />
                                <DateInput
                                    label="Due Date"
                                    value={
                                        businessExpenseFormData.due_date
                                            ?.toISOString()
                                            .split("T")[0] || ""
                                    }
                                    onChange={(e) => {
                                        setBusinessExpenseFormData((prev) => ({
                                            ...structuredClone(prev),
                                            due_date: new Date(e.target.value),
                                        }));
                                    }}
                                />
                            </>
                        </Switcher>
                    )}

                    <Button
                        type="submit"
                        value="Add Operational Expense"
                    ></Button>
                    <Button
                        value="Cancel"
                        onClick={() => setDrawerOpen(false)}
                    ></Button>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
