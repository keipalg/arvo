import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc, queryClient } from "../../../../utils/trpcClient";
import DataTable, {
    type FilterOption,
} from "../../../../components/table/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../utils/trpcClient";
import { useEffect, useState } from "react";

import Select from "../../../../components/input/Select";
import Button from "../../../../components/button/Button";
import AddButton from "../../../../components/button/AddButton";
import RightDrawer from "../../../../components/drawer/RightDrawer";
import TextInput from "../../../../components/input/TextInput";
import TextArea from "../../../../components/input/TextArea";
import PageTitle from "../../../../components/layout/PageTitle";
import { MoreButton } from "../../../../components/button/MoreButton";
import { MoreButtonProvider } from "../../../../components/button/MoreButtonProvider";
import MaterialCostTable from "../../../../components/pricing/MaterialCostTable";
import NumberInput from "../../../../components/input/NumberInput";
import Metric from "../../../../components/metric/Metric";
import BatchDetails from "../../../../components/table/DataTableDetailProductionBatch";
import ToastNotification from "../../../../components/modal/ToastNotification";
import ConfirmationModal from "../../../../components/modal/ConfirmationModal";
import {
    productionBatchInputValidation,
    productionBatchUpdateValidation,
} from "@arvo/shared";
import type React from "react";
import { useIsSmUp } from "../../../../utils/screenWidth";

export const Route = createFileRoute("/_protected/goods/productionBatch/")({
    component: ProductionBatchList,
});

type ProductionBatch =
    inferRouterOutputs<AppRouter>["productionBatch"]["list"][number] & {
        actions: string;
    };

type Materials = {
    materialId: string;
    name: string;
    amount: number;
    quantity: number;
    costPerUnit: number;
    materialCost: number;
    unitAbbreviation: string;
};

type MaterialOutputRatio = {
    id: string;
    name: string;
    materialId: string;
    materialName: string;
    input: number;
    abbreviation: string;
    costPerUnit: number;
    currentQuantity: number;
};

function ProductionBatchList() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [productionDate, setProductionDate] = useState("");
    const [goodId, setGoodId] = useState("");
    const [note, setNote] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [productionCost, setProductionCost] = useState(0);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [materials, setMaterials] = useState<Materials[]>([]);
    const [materialOutputRatios, setMaterialOutputRatios] = useState<
        MaterialOutputRatio[]
    >([]);
    const [editingBatchId, setEditingBatchId] = useState<string>("");
    const [maxQuantity, setMaxQuantity] = useState(0);
    const [selectedItemForDeletion, setSelectedItemForDeletion] = useState("");
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false);
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
    const { data, isLoading, error } = useQuery(
        trpc.productionBatch.list.queryOptions(),
    );
    const { data: goods } = useQuery(trpc.goods.list.queryOptions());
    const { data: materialOutputRatioData } = useQuery(
        trpc.goods.materialOutputRatio.queryOptions(),
    );
    const { data: materialList } = useQuery(
        trpc.materials.materialList.queryOptions(),
    );
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data: topProducedMetrics } = useQuery(
        trpc.productionBatch.mostProducedProductWithComparison.queryOptions({
            timezone,
        }),
    );
    const { data: leastProducedMetrics } = useQuery(
        trpc.productionBatch.leastProducedProductWithComparison.queryOptions({
            timezone,
        }),
    );

    const isSmUp = useIsSmUp();

    const calculateProductionCost = (
        ratios: MaterialOutputRatio[],
        quantity: number,
    ) => {
        return ratios.reduce((total, ratio) => {
            return total + ratio.input * ratio.costPerUnit * quantity;
        }, 0);
    };

    const detailsRender = (row: ProductionBatch) => {
        const defaultMobileSet = new Set<keyof ProductionBatch>();
        if (columns[0]) defaultMobileSet.add(columns[0].key);
        if (columns[1]) defaultMobileSet.add(columns[1].key);
        const actionsCol = columns.find((c) => String(c.key) === "actions");
        if (actionsCol) defaultMobileSet.add(actionsCol.key);

        const mobileSet = new Set<keyof ProductionBatch>(
            Array.from(defaultMobileSet),
        );

        const visibleMobileColumnsCount = columns.filter((c) =>
            mobileSet.has(c.key),
        ).length;

        return (
            <BatchDetails
                row={row}
                columnsLength={columns.length}
                visibleMobileColumnsCount={visibleMobileColumnsCount}
                isSmUp={isSmUp}
            />
        );
    };

    const columns: Array<{
        key: keyof ProductionBatch;
        header: string;
        render?: (
            value: ProductionBatch[keyof ProductionBatch],
            row: ProductionBatch,
        ) => React.ReactNode;
    }> = [
        {
            key: "productionDate",
            header: "Production Date",
            render: (value) => (
                <>{new Date(value as string).toLocaleDateString()}</>
            ),
        },
        {
            key: "goodName",
            header: "Product Name",
        },
        {
            key: "quantity",
            header: "Quantity",
        },
        {
            key: "productionCost",
            header: "Material Cost",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "actions",
            header: "",
            render: (_value, row) => (
                <>
                    <MoreButton
                        id={row.id}
                        onEdit={() => handleEdit(row)}
                        onDeleteModal={() => {
                            setIsConfirmationModalOpen(true);
                            setSelectedItemForDeletion(row.id);
                        }}
                    />
                </>
            ),
        },
    ];

    const tableFilterOptions: FilterOption<ProductionBatch>[] = [
        {
            key: "productionDate",
            label: "Production Date",
            values: data
                ? [...new Set(data.map((batch) => batch.productionDate))].map(
                      (date) => ({
                          key: date,
                          label: new Date(date).toLocaleDateString(),
                      }),
                  )
                : [],
        },
    ];

    const resetForm = () => {
        setGoodId("");
        setProductionDate("");
        setQuantity(0);
        setProductionCost(0);
        setMaterials([]);
        setMaterialOutputRatios([]);
        setEditingBatchId("");
        setNote("");
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };
    const tabledData = data?.map((element) => ({
        ...element,
        actions: "",
    }));

    const addProductionBatchMutation = useMutation(
        trpc.productionBatch.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.productionBatch.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.materialList.queryKey(),
                });
                setToastMessage({
                    kind: "SUCCESS",
                    content: `Added batch production successfully!`,
                });
                setVisibleToast(true);
            },
            onError: () => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error adding batch production `,
                });
            },
        }),
    );

    const updateProductionBatchMutation = useMutation(
        trpc.productionBatch.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.productionBatch.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.materialList.queryKey(),
                });
                setToastMessage({
                    kind: "SUCCESS",
                    content: `Updated batch production successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error updating batch production: ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const deleteProductionBatchMutation = useMutation(
        trpc.productionBatch.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.productionBatch.list.queryKey(),
                });

                setToastMessage({
                    kind: "SUCCESS",
                    content: `Deleted batch production successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error deleting batch production ${error.message}`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBatchId) {
            // Validate the number of inventry quantity won't be negative or not by the editing
            const originalBatch = data?.find((b) => b.id === editingBatchId);
            const quantityReduction = (originalBatch?.quantity || 0) - quantity;

            if (quantityReduction > 0) {
                const wouldGoNegative = materialOutputRatios.some((ratio) => {
                    const currentInventory =
                        ratio.currentQuantity + ratio.input * quantityReduction;
                    return currentInventory < 0;
                });

                if (wouldGoNegative) {
                    setFormErrors({
                        quantity:
                            "Reducing quantity would make inventory negative",
                    });
                    return;
                }
            }

            const result = productionBatchUpdateValidation.safeParse({
                id: editingBatchId,
                goodId,
                productionDate,
                quantity,
                productionCost,
                materials,
                notes: note,
            });

            console.log(result.data);

            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                console.log(errors);
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            updateProductionBatchMutation.mutate(result.data);
            setDrawerOpen(false);
            resetForm();
        } else {
            const result = productionBatchInputValidation.safeParse({
                goodId,
                productionDate,
                quantity,
                productionCost,
                materials,
                notes: note,
            });

            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                console.log(errors);
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            addProductionBatchMutation.mutate(result.data);
            setDrawerOpen(false);
            resetForm();
        }
    };

    const handleEdit = (productionBatch: ProductionBatch) => {
        setEditingBatchId(productionBatch.id);
        setDrawerOpen(true);
        setGoodId(productionBatch.goodId);
        setProductionDate(
            productionBatch.productionDate
                ? new Date(productionBatch.productionDate)
                      .toISOString()
                      .split("T")[0]
                : "",
        );
        setQuantity(productionBatch.quantity || 0);
        setNote(productionBatch.notes || "");
    };

    const handleDelete = (id: string) => {
        deleteProductionBatchMutation.mutate({ id });
    };

    // find material output ratio by selected good id
    useEffect(() => {
        setMaterialOutputRatios(
            materialOutputRatioData
                ?.filter((ratio) => ratio.id === goodId)
                .map((ratio) => ({
                    id: ratio.id ?? "",
                    name: ratio.name ?? "",
                    materialId: ratio.materialId ?? "",
                    materialName: ratio.materialName ?? "",
                    input: ratio.input ?? 0,
                    abbreviation: ratio.abbreviation ?? "",
                    costPerUnit: ratio.costPerUnit ?? 0,
                    currentQuantity:
                        materialList?.find((m) => ratio.materialId === m.id)
                            ?.quantity ?? 0,
                })) ?? [],
        );
    }, [goodId, materialOutputRatioData, materialList]);

    // Update current quantities when materialList changes
    useEffect(() => {
        if (materialOutputRatios.length > 0 && materialList) {
            setMaterialOutputRatios((prev) =>
                prev.map((ratio) => ({
                    ...ratio,
                    currentQuantity:
                        materialList.find((m) => m.id === ratio.materialId)
                            ?.quantity ?? 0,
                })),
            );
        }
    }, [materialList]);

    useEffect(() => {
        if (materialOutputRatios.length > 0) {
            const maxQuantityForEach = materialOutputRatios.map((ratio) => {
                return ratio.currentQuantity / ratio.input;
            });

            setMaxQuantity(Math.floor(Math.min(...maxQuantityForEach)));
        }
    }, [materialOutputRatios]);

    useEffect(() => {
        if (materialOutputRatios && quantity > 0) {
            const cost = calculateProductionCost(
                materialOutputRatios,
                quantity,
            );
            setProductionCost(cost);
        }
    }, [materialOutputRatios, quantity]);

    useEffect(() => {
        const materialsArray = materialOutputRatios?.map((ratio) => ({
            materialId: ratio.materialId,
            name: ratio.materialName ?? "",
            amount: ratio.input * quantity,
            quantity: 0,
            costPerUnit: ratio.costPerUnit ?? 0,
            materialCost: 0,
            unitAbbreviation: ratio.abbreviation ?? "",
        }));
        setMaterials(materialsArray);
    }, [materialOutputRatios, quantity]);

    return (
        <BaseLayout title="Batch Production">
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
            <ConfirmationModal
                confirmationMessage={`Are you sure you want to delete this product?`}
                isConfirmationModalOpen={isConfirmationModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                onConfirm={() => handleDelete(selectedItemForDeletion)}
            />
            <div className="flex justify-between">
                <PageTitle
                    title="Batch Production"
                    info="Batch Production helps you with recording and managing your product batches to keep all production details organized in one place."
                />
                <AddButton
                    value="Add Batch Production"
                    icon="/icon/plus.svg"
                    onClick={() => setDrawerOpen(true)}
                ></AddButton>
            </div>
            <div className="flex gap-6 py-2 overflow-x-auto">
                {topProducedMetrics && (
                    <Metric
                        value={topProducedMetrics.productName}
                        changePercent={topProducedMetrics.percentageChange}
                        topText="Most produced item"
                        bottomText="than last month"
                    />
                )}
                {leastProducedMetrics && (
                    <Metric
                        value={leastProducedMetrics.productName}
                        changePercent={leastProducedMetrics.percentageChange}
                        topText="Least produced item"
                        bottomText="than last month"
                    />
                )}
            </div>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <MoreButtonProvider>
                    <DataTable
                        columns={columns}
                        data={tabledData || []}
                        filterOptions={tableFilterOptions}
                        detailRender={detailsRender}
                        sortOptions={[
                            {
                                key: "productionDate",
                                label: "Production Date (Oldest → Newest)",
                                order: "asc",
                            },
                            {
                                key: "productionDate",
                                label: "Production Date (Newest → Oldest)",
                                order: "desc",
                            },
                        ]}
                    />
                </MoreButtonProvider>
            )}
            <RightDrawer
                title={
                    !editingBatchId
                        ? "Add New Batch Production"
                        : "Edit Batch Production"
                }
                narrower={true}
                isOpen={drawerOpen}
                onClose={() => closeDrawer()}
            >
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <TextInput
                        label="Production Date"
                        name="productionDate"
                        required={true}
                        type="date"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                        error={formErrors.productionDate}
                    ></TextInput>
                    <Select
                        label="Product Made"
                        required={true}
                        name="product"
                        value={goodId}
                        disabled={!!editingBatchId}
                        options={[
                            { value: "", label: "" },
                            ...(goods?.map((good) => ({
                                value: good.id,
                                label: good.name,
                            })) || []),
                        ]}
                        onChange={(e) => setGoodId(e.target.value)}
                    ></Select>

                    <NumberInput
                        label="Produced Quantity"
                        required={true}
                        min="0"
                        step="1"
                        value={quantity}
                        max={maxQuantity.toString()}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        error={formErrors.quantity}
                    ></NumberInput>
                    <MaterialCostTable
                        materials={materialOutputRatios.map((ratio) => ({
                            materialName: ratio.materialName,
                            unitAbbreviation: ratio.abbreviation,
                            usedAmount: ratio.input * quantity,
                            inventoryQuantity: ratio.currentQuantity,
                            cost: ratio.costPerUnit * ratio.input * quantity,
                            errorCondition:
                                ratio.input * quantity > ratio.currentQuantity,
                        }))}
                        totalCost={`$${Number(productionCost).toFixed(2)}`}
                    />

                    <TextArea
                        label="Notes"
                        name="notes"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></TextArea>

                    <div
                        className={`mt-3 grid ${editingBatchId && "grid-cols-2 gap-2"}`}
                    >
                        {editingBatchId && (
                            <Button
                                type="button"
                                value="Delete"
                                onClick={() => {
                                    setIsConfirmationModalOpen(true);
                                    setSelectedItemForDeletion(editingBatchId);
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
