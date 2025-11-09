import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc, queryClient } from "../../../../utils/trpcClient";
import DataTable, {
    type FilterOption,
} from "../../../../components/table/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../utils/trpcClient";
import React, { useEffect, useState } from "react";

import Select from "../../../../components/input/Select";
import Button from "../../../../components/button/Button";
import RightDrawer from "../../../../components/drawer/RightDrawer";
import TextInput from "../../../../components/input/TextInput";
import PageTitle from "../../../../components/layout/PageTitle";
import { MoreButton } from "../../../../components/button/MoreButton";

import {
    productionBatchInputValidation,
    productionBatchUpdateValidation,
} from "@arvo/shared";
import NumberInput from "../../../../components/input/NumberInput";

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
    const [quantity, setQuantity] = useState(0);
    const [productionCost, setProductionCost] = useState(0);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [materials, setMaterials] = useState<Materials[]>([]);
    const [materialOutputRatios, setMaterialOutputRatios] = useState<
        MaterialOutputRatio[]
    >([]);
    const [editingBatchId, setEditingBatchId] = useState<string>("");
    const [maxQuantity, setMaxQuantity] = useState(0);
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

    const calculateProductionCost = (
        ratios: MaterialOutputRatio[],
        quantity: number,
    ) => {
        return ratios.reduce((total, ratio) => {
            return total + ratio.input * ratio.costPerUnit * quantity;
        }, 0);
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
            header: "Production Cost",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "actions",
            header: "",
            render: (_value, row) => (
                <>
                    <MoreButton
                        onEdit={() => handleEdit(row)}
                        onDeleteModal={() => handleDelete(row.id)}
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
            },
        }),
    );

    const deleteProductionBatchMutation = useMutation(
        trpc.productionBatch.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.productionBatch.list.queryKey(),
                });
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
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this good?")) {
            deleteProductionBatchMutation.mutate({ id });
            closeDrawer();
        }
    };

    console.log("Submitting data:", {
        goodId,
        productionDate,
        quantity,
        productionCost,
        materials,
    });

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

            setMaxQuantity(Math.floor(Math.max(...maxQuantityForEach)));
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
            <div className="flex justify-between">
                <PageTitle title="Batch Production" />
                <Button
                    value="Add Batch Production"
                    icon="/icon/plus.svg"
                    onClick={() => setDrawerOpen(true)}
                ></Button>
            </div>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable
                    columns={columns}
                    data={tabledData || []}
                    filterOptions={tableFilterOptions}
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
            )}
            <RightDrawer isOpen={drawerOpen} onClose={() => closeDrawer()}>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <TextInput
                        label="Production Date"
                        name="productionDate"
                        type="date"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                        error={formErrors.productionDate}
                    ></TextInput>
                    <Select
                        label="Product"
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
                        label="Quantity"
                        min="0"
                        step="1"
                        value={quantity}
                        max={maxQuantity.toString()}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        error={formErrors.quantity}
                    ></NumberInput>

                    <ul>
                        {" "}
                        Recipe:
                        {materialOutputRatios?.map((ratio) => (
                            <li key={ratio.id}>
                                {ratio.materialName} : {ratio.input}{" "}
                                {ratio.abbreviation} | Used Amount{" "}
                                {Number(ratio.input * quantity).toFixed(2)}{" "}
                                {ratio.abbreviation} | Inventory{" "}
                                {ratio.currentQuantity} {ratio.abbreviation}
                                {ratio.input * quantity >
                                    ratio.currentQuantity && (
                                    <p className="text-red-500">
                                        Error: Your inventory is insufficient.
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p>
                        Total Material Cost: {Number(productionCost).toFixed(2)}
                    </p>

                    <div className="flex gap-2">
                        {editingBatchId && (
                            <Button
                                type="button"
                                value="Delete"
                                onClick={() => handleDelete(editingBatchId)}
                            ></Button>
                        )}
                        <Button type="submit" value="Save"></Button>
                    </div>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
