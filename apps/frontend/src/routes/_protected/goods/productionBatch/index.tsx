import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc, queryClient } from "../../../../utils/trpcClient";
import DataTable from "../../../../components/table/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";
import React, { useState } from "react";

import Select from "../../../../components/input/Select";
import Button from "../../../../components/button/Button";
import RightDrawer from "../../../../components/drawer/RightDrawer";
import ProductionStatus from "../../../../components/badge/ProductionStatus.tsx";
import TextInput from "../../../../components/input/TextInput";
import SelectCustom from "../../../../components/input/SelectCustom";

import {
    calculateMaterialCost,
    calculateTotalMaterialCost,
} from "../../../../utils/pricing.ts";

import { productionBatchInputValidation } from "shared/validation/productionBatchInputValidation";

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
    costPerUnit: number;
    materialCost: number;
    unitAbbreviation: string;
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

    console.log("Raw batch data :", data);
    console.log("Raw materialList data:", materialList);
    console.log("Raw productionStatus data:", productionStatusList);

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
        // TODO: need to implement edit
        // {
        //     key: "actions",
        //     header: "Actions",
        //     render: (_value, row) => (
        //         <>
        //             <div className="flex gap-2">
        //                 <button
        //                     className="cursor-pointer"
        //                     onClick={() => handleEdit(row)}
        //                 >
        //                     <img src="/icon/edit.svg"></img>
        //                 </button>
        //             </div>
        //         </>
        //     ),
        // },
    ];

    const resetForm = () => {};

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };
    const tabledData = data?.map((element) => ({
        ...element,
        actions: "",
    }));

    const addMaterialRow = () => {
        setMaterials([
            ...materials,
            {
                materialId: "",
                name: "",
                amount: 0,
                unitAbbreviation: "",
                costPerUnit: 0,
                materialCost: 0,
            },
        ]);
    };

    const updateMaterialRow = (
        index: number,
        field: keyof Materials,
        value: string | number,
    ) => {
        setMaterials((prevMaterials) => {
            const updatedMaterials = [...prevMaterials];
            updatedMaterials[index] = {
                ...updatedMaterials[index],
                [field]: value,
            };

            if (field === "materialId") {
                const chosenMaterial = materialList?.find(
                    (material) => material.id === value,
                );
                if (chosenMaterial) {
                    updatedMaterials[index].unitAbbreviation =
                        chosenMaterial.unitAbbreviation;
                    updatedMaterials[index].costPerUnit =
                        chosenMaterial.costPerUnit;
                    updatedMaterials[index].materialCost =
                        calculateMaterialCost(
                            updatedMaterials[index].amount,
                            chosenMaterial.costPerUnit,
                        );
                }
            }

            if (field === "amount" || field === "costPerUnit") {
                updatedMaterials[index].materialCost = calculateMaterialCost(
                    updatedMaterials[index].amount,
                    updatedMaterials[index].costPerUnit,
                );
            }

            const totalCost = calculateTotalMaterialCost(updatedMaterials);
            setProductionCost(totalCost);

            return updatedMaterials;
        });
    };

    const addProductionBatchMutation = useMutation(
        trpc.productionBatch.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.productionBatch.list.queryKey(),
                });
            },
        }),
    );
    // TODO: need to implement delete
    // const deleteGoodMutation = useMutation(
    //     trpc.goods.delete.mutationOptions({
    //         onSuccess: async () => {
    //             await queryClient.invalidateQueries({
    //                 queryKey: trpc.goods.list.queryKey(),
    //             });
    //         },
    //     }),
    // );

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
    };
    // need to implement delete
    // const handleDelete = (id: string) => {
    //     if (window.confirm("Are you sure you want to delete this good?")) {
    //         deleteGoodMutation.mutate({ id });
    //     }
    // };
    console.log("Submitting data:", {
        goodId,
        productionDate,
        quantity,
        productionCost,
        materials,
        statusKey,
    });

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

                    <Button
                        type="button"
                        value="Add Material"
                        onClick={addMaterialRow}
                    ></Button>
                    {materials.map((row, index) => (
                        <div key={index}>
                            <Select
                                label="Material"
                                value={row.materialId}
                                options={[
                                    { value: "", label: "" },
                                    ...(materialList?.map((material) => ({
                                        value: material.id,
                                        label: material.name,
                                    })) || []),
                                ]}
                                onChange={(e) =>
                                    updateMaterialRow(
                                        index,
                                        "materialId",
                                        e.target.value,
                                    )
                                }
                            />

                            <TextInput
                                label="Amount"
                                type="number"
                                value={row.amount}
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) =>
                                    updateMaterialRow(
                                        index,
                                        "amount",
                                        Number(e.target.value),
                                    )
                                }
                            ></TextInput>
                            {row.unitAbbreviation && (
                                <span>Unit: {row.unitAbbreviation}</span>
                            )}
                        </div>
                    ))}

                    <p>Total Material Cost: {productionCost}</p>

                    <Button value="Cancel"></Button>
                    <Button type="submit" value="Add Product"></Button>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
