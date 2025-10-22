import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { trpc, queryClient } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";
import React, { useState, useEffect } from "react";

import Select from "../../../components/input/Select";
import Button from "../../../components/button/Button";
import RightDrawer from "../../../components/drawer/RightDrawer";
import TextArea from "../../../components/input/TextArea";
import { goodsInputValidation } from "shared/validation/goodsValidation";
import TextInput from "../../../components/input/TextInput";
export const Route = createFileRoute("/_protected/goods/")({
    component: GoodsList,
});

type Goods = inferRouterOutputs<AppRouter>["goods"]["list"][number] & {
    actions: string;
};

type Materials = {
    materialId: string;
    name: string;
    amount: number;
    unitAbbreviation: string;
};

interface ProductType {
    id: string;
    name: string;
}

type MaterialWithUnit = {
    id: string;
    name: string;
    unitId: string;
    costPerUnit: number;
    unit: {
        abbreviation: string;
    };
};

function GoodsList() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [name, setName] = useState("");
    const [productType, setProductType] = useState("");
    const [retailPrice, setRetailPrice] = useState(0.0);
    const [note, setNote] = useState("");
    const [inventoryQuantity, setInventoryQuantity] = useState(0);
    const [minimumStockLevel, setMinimumStockLevel] = useState(0);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [materials, setMaterials] = useState<Materials[]>([]);
    const { data, isLoading, error } = useQuery(trpc.goods.list.queryOptions());
    const { data: materialList } = useQuery(
        trpc.goods.materials.queryOptions(),
    );
    const { data: productTypesList } = useQuery(
        trpc.goods.productTypes.queryOptions(),
    ) as {
        data: ProductType[] | undefined;
    };

    console.log("Raw product data:", data);
    console.log("Raw productTypes data:", productTypesList);

    const columns: Array<{
        key: keyof Goods;
        header: string;
        render?: (value: Goods[keyof Goods], row: Goods) => React.ReactNode;
    }> = [
        {
            key: "name",
            header: "Product Name",
        },
        {
            key: "type",
            header: "Product Type",
        },
        {
            key: "inventoryQuantity",
            header: "Inventory Quantity",
        },
        {
            key: "producedQuantity",
            header: "Produced Quantity",
        },
        {
            key: "retailPrice",
            header: "Unit Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "actions",
            header: "Actions",
            render: (_value, row) => (
                <>
                    <div className="flex gap-2">
                        <button className="text-blue-400 hover:underline">
                            Edit
                        </button>
                        <button
                            className="text-blue-400 hover:underline"
                            onClick={() => handleDelete(row.id)}
                        >
                            Delete
                        </button>
                    </div>
                </>
            ),
        },
    ];

    const resetForm = () => {
        setName("");
        setProductType(productTypesList?.[0]?.id || "");
        setRetailPrice(0.0);
        setInventoryQuantity(0);
        setMaterials([]);
        setNote("");
        setMinimumStockLevel(0);
        setMaterials([]);
        setFormErrors({});
    };

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
            { materialId: "", name: "", amount: 0.0, unitAbbreviation: "" },
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
                    updatedMaterials[index].unitAbbreviation = (
                        chosenMaterial as MaterialWithUnit
                    ).unit.abbreviation;
                }
            }
            console.log(updatedMaterials);

            return updatedMaterials;
        });
    };

    const addGoodMutation = useMutation(
        trpc.goods.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.list.queryKey(),
                });
            },
        }),
    );

    const deleteGoodMutation = useMutation(
        trpc.goods.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.list.queryKey(),
                });
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = goodsInputValidation.safeParse({
            name,
            productTypeId: productType,
            retailPrice,
            note,
            inventoryQuantity,
            minimumStockLevel,
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
        addGoodMutation.mutate(result.data);
        setDrawerOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this good?")) {
            deleteGoodMutation.mutate({ id });
        }
    };

    useEffect(() => {
        if (productTypesList && productTypesList.length > 0 && !productType) {
            setProductType(productTypesList[0].id);
        }
    }, [productType, productTypesList]);

    return (
        <BaseLayout title="Product List">
            <h3 className="">Your Products</h3>
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
                        label="Product Name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={formErrors.name}
                    ></TextInput>
                    <Select
                        label="Product Type"
                        name="productType"
                        value={productType}
                        options={[
                            { value: "", label: "" },
                            ...(productTypesList?.map((productType) => ({
                                value: productType.id,
                                label: productType.name,
                            })) || []),
                        ]}
                        onChange={(e) => setProductType(e.target.value)}
                    ></Select>

                    <TextInput
                        label="Quantity"
                        type="number"
                        value={inventoryQuantity}
                        onChange={(e) =>
                            setInventoryQuantity(Number(e.target.value))
                        }
                        error={formErrors.inventoryQuantity}
                    ></TextInput>
                    <TextInput
                        label="Min. Stock Level"
                        type="number"
                        value={minimumStockLevel}
                        onChange={(e) =>
                            setMinimumStockLevel(Number(e.target.value))
                        }
                        error={formErrors.minimumStockLevel}
                    ></TextInput>
                    <div>Recipe Per Item</div>
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
                    <TextInput
                        label="Price (per unit)"
                        type="number"
                        value={Number(retailPrice).toFixed(2)}
                        onChange={(e) => setRetailPrice(Number(e.target.value))}
                        step="0.01"
                        error={formErrors.retailPrice}
                    ></TextInput>
                    <TextArea
                        label="Notes"
                        name="notes"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></TextArea>
                    <Button value="Cancel"></Button>
                    <Button type="submit" value="Add Product"></Button>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
