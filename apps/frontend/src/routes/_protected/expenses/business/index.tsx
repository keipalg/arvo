import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { queryClient, trpc } from "../../../../utils/trpcClient";
import DataTable from "../../../../components/table/DataTable";
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
import FormLabel from "../../../../components/input/FormLabel";

export const Route = createFileRoute("/_protected/expenses/business/")({
    component: BusinessExpense,
});

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
        | "miscellaneous";
    name: string;
    cost: number;
    payee: string;
    payment_method: "credit" | "cash";
    selectedInventoryLossOption: "goods_loss" | "materials_loss";
    good_id: string | null;
    materialAndSupply_id: string | null;
    quantity: number;
    notes: string;
    attach_recipt: string;
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
        selectedInventoryLossOption: "goods_loss",
        good_id: "",
        materialAndSupply_id: "",
        quantity: 0,
        notes: "",
        attach_recipt: "",
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
    ];
    console.log("combinedExpensesList", combinedExpensesList);

    useEffect(() => {
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
    ]);

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
            },
        }),
    );

    const deleteOperationalExpenseMutation = useMutation(
        trpc.operationalExpense.delete.mutationOptions({
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
                closeDrawer();
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
            },
        }),
    );

    const deleteStudioOverheadExpenseMutation = useMutation(
        trpc.studioOverheadExpense.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.studioOverheadExpense.list.queryKey(),
                });
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
                          attach_recipt: businessExpenseFormData.attach_recipt,
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
                          attach_recipt: businessExpenseFormData.attach_recipt,
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
                attach_recipt: businessExpenseFormData.attach_recipt,
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

                return highlightValues.includes(String(value)) ? (
                    <span className="capitalize bg-arvo-blue-80 text-white rounded-xl px-2 py-1">
                        {String(value).replace("_", " ")}
                    </span>
                ) : (
                    <span className="capitalize bg-arvo-orange-50 text-arvo-orange-100 rounded-xl px-2 py-1">
                        {String(value).replace("_", " ")}
                    </span>
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
                    <>
                        {d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </>
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
            render: (_value, row) => (
                <>
                    <MoreButton
                        onEdit={() => {
                            setBusinessExpenseFormData({
                                ...row,
                                selectedInventoryLossOption: row.good_id
                                    ? "goods_loss"
                                    : "materials_loss",
                                cost: Number(row.cost),
                            });
                            setDrawerOpen(true);
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
                        onDelete={() => {
                            handleDelete(row.expense_category, row.id);
                        }}
                    />
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
            <div className="flex justify-between">
                <PageTitle
                    title="Business Expense"
                    info="Business Expense is where you log costs that keep your business running."
                />
                <Button
                    value="Add"
                    onClick={() => {
                        setToggleOpen(false);
                        setBusinessExpenseFormData(initialBusinessExpense);
                        setDrawerOpen(true);
                    }}
                    icon="/icon/plus.svg"
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
                <h3 className="text-2xl">Add New Expense</h3>
                <form
                    onSubmit={(e) => {
                        handleSubmit(e);
                    }}
                >
                    <TextInput
                        type="date"
                        label="Date"
                        value={
                            businessExpenseFormData.createdAt
                                ? businessExpenseFormData.createdAt
                                      .toISOString()
                                      .substring(0, 10)
                                : ""
                        }
                        onChange={(e) => {
                            setBusinessExpenseFormData((prev) => ({
                                ...prev,
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
                                        setBusinessExpenseFormData((prev) => ({
                                            ...prev,
                                            good_id: e.target.value,
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
                                            materialAndSupply_id:
                                                e.target.value,
                                            good_id: "",
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
                            <TextInput
                                type="number"
                                step="0.1"
                                label={
                                    "Quantity: " +
                                    (businessExpenseFormData.selectedInventoryLossOption ===
                                    "goods_loss"
                                        ? "(item)"
                                        : materialsList?.find(
                                              (m) =>
                                                  m.id ===
                                                  businessExpenseFormData.materialAndSupply_id,
                                          )?.unitAbbreviation || "")
                                }
                                name="quantity"
                                value={businessExpenseFormData.quantity}
                                onChange={(e) => {
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
                                        ...prev,
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
                                        ...prev,
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
                    {/* File upload to be implemented later*/}
                    {/*	
					<FileInput
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
                        <Switcher
                            label="Make this a recurring expense?"
                            checked={toggleOpen}
                            onChange={() => setToggleOpen((prev) => !prev)}
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
                                        setBusinessExpenseFormData((prev) => ({
                                            ...prev,
                                            repeat_every: e.target
                                                .value as BusinessExpense["repeat_every"],
                                        }));
                                    }}
                                    options={[
                                        { label: "Daily", value: "daily" },
                                        { label: "Weekly", value: "weekly" },
                                        {
                                            label: "Bi-Weekly",
                                            value: "bi-weekly",
                                        },
                                        { label: "Monthly", value: "monthly" },
                                        {
                                            label: "Quarterly",
                                            value: "quarterly",
                                        },
                                        { label: "Yearly", value: "yearly" },
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
                                        setBusinessExpenseFormData((prev) => ({
                                            ...prev,
                                            start_date: new Date(
                                                e.target.value,
                                            ),
                                        }));
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
                                        setBusinessExpenseFormData((prev) => ({
                                            ...prev,
                                            due_date: new Date(e.target.value),
                                        }));
                                    }}
                                    options={dueDateOptions}
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
