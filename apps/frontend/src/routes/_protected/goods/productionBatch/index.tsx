import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc, queryClient } from "../../../../utils/trpcClient";
import DataTable from "../../../../components/table/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../utils/trpcClient";
import React, { useEffect, useState } from "react";

import Select from "../../../../components/input/Select";
import Button from "../../../../components/button/Button";
import RightDrawer from "../../../../components/drawer/RightDrawer";
import ProductionStatus from "../../../../components/badge/ProductionStatus.tsx";
import TextInput from "../../../../components/input/TextInput";
import SelectCustom from "../../../../components/input/SelectCustom";

import { productionBatchInputValidation } from "@arvo/shared";

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
};

function ProductionBatchList() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [productionDate, setProductionDate] = useState("");
    const [goodId, setGoodId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [productionCost, setProductionCost] = useState(0);
    const [statusKey, setStatusKey] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [materials, setMaterials] = useState<Materials[]>([]);
    const [materialOutputRatios, setMaterialOutputRatios] = useState<
        MaterialOutputRatio[]
    >([]);
    const [editingBatchId, setEditingBatchId] = useState<string>("");
    const { data, isLoading, error } = useQuery(
        trpc.productionBatch.list.queryOptions(),
    );
    const { data: goods } = useQuery(trpc.goods.list.queryOptions());
    const { data: materialList } = useQuery(
        trpc.materials.materialList.queryOptions(),
    );
    const { data: productionStatusList } = useQuery(
        trpc.productionBatch.productionStatus.queryOptions(),
    );
    const { data: materialOutputRatioData } = useQuery(
        trpc.goods.materialOutputRatio.queryOptions(),
    );

    console.log("Raw batch data :", data);
    console.log("Raw materialList data:", materialList);
    console.log("Raw productionStatus data:", productionStatusList);
    console.log("Raw mateiralOutputRatio data:", materialOutputRatioData);

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
            render: (value) => {
                if (typeof value === "string" || value instanceof Date) {
                    const dateObj = new Date(value);
                    return isNaN(dateObj.getTime()) ? (
                        <></>
                    ) : (
                        <>{dateObj.toLocaleDateString()}</>
                    );
                }
                return <></>;
            },
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
            key: "status",
            header: "Status",
            render: (value) => {
                return typeof value === "string" ? (
                    <ProductionStatus statusKey={String(value)} />
                ) : (
                    <></>
                );
            },
        },
        {
            key: "actions",
            header: "Actions",
            render: (_value, row) => (
                <>
                    <div className="flex gap-2">
                        <button
                            className="cursor-pointer"
                            onClick={() => handleEdit(row)}
                        >
                            <img src="/icon/edit.svg"></img>
                        </button>
                    </div>
                </>
            ),
        },
    ];

    const resetForm = () => {
        setGoodId("");
        setProductionDate("");
        setQuantity(0);
        setProductionCost(0);
        setStatusKey("");
        setMaterials([]);
        setMaterialOutputRatios([]);
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
        const result = productionBatchInputValidation.safeParse({
            goodId,
            productionDate,
            quantity,
            productionCost,
            materials,
            statusKey,
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
    };

    const handleEdit = (productionBatch: ProductionBatch) => {
        setEditingBatchId(productionBatch.id);
        setDrawerOpen(true);
        setGoodId(productionBatch.goodId);
        const date = new Date(productionBatch.productionDate);
        const formattedDate = date.toISOString().slice(0, 16);
        setProductionDate(formattedDate);

        setQuantity(productionBatch.quantity || 0);
        // TODO: need to fix status
        // setStatusKey(productionBatch.statusKey);
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
        statusKey,
    });

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
                })) ?? [],
        );
    }, [goodId, materialOutputRatioData]);

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
        <BaseLayout title="Product List">
            <h3 className=""></h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <Button value="Add" onClick={() => setDrawerOpen(true)}></Button>
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
            <RightDrawer isOpen={drawerOpen} onClose={() => closeDrawer()}>
                <h3 className="text-2xl">Product Information</h3>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <TextInput
                        label="Production Date"
                        name="productionDate"
                        type="datetime-local"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                        error={formErrors.productionDate}
                    ></TextInput>
                    <Select
                        label="Product"
                        name="product"
                        value={goodId}
                        options={[
                            { value: "", label: "" },
                            ...(goods?.map((good) => ({
                                value: good.id,
                                label: good.name,
                            })) || []),
                        ]}
                        onChange={(e) => setGoodId(e.target.value)}
                    ></Select>

                    <TextInput
                        label="Quantity"
                        type="number"
                        value={quantity}
                        placeholder="0"
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        error={formErrors.quantity}
                    ></TextInput>

                    <SelectCustom
                        label="Status"
                        name="status"
                        value={statusKey}
                        options={
                            productionStatusList
                                ? productionStatusList.map((statusOption) => ({
                                      value: statusOption.key,
                                      label: statusOption.name,
                                      render: (
                                          <ProductionStatus
                                              statusKey={String(
                                                  statusOption.key,
                                              )}
                                          ></ProductionStatus>
                                      ),
                                  }))
                                : []
                        }
                        onChange={setStatusKey}
                    ></SelectCustom>
                    <ul>
                        {" "}
                        Recipe:
                        {materialOutputRatios?.map((ratio) => (
                            <li key={ratio.id}>
                                {ratio.materialName} : {ratio.input}{" "}
                                {ratio.abbreviation}
                            </li>
                        ))}
                    </ul>
                    <p>Total Material Cost: {productionCost}</p>

                    <Button value="Cancel" onClick={() => resetForm()}></Button>
                    <Button
                        type="button"
                        value="Delete"
                        onClick={() => handleDelete(editingBatchId)}
                    />
                    <Button type="submit" value="Add Product"></Button>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
