import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { trpc, queryClient, type AppRouter } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import React, { useState, useEffect } from "react";

import { PriceSuggestionWidget } from "../../../components/pricing/PriceSuggestionWidget";
import Select from "../../../components/input/Select";
import Button from "../../../components/button/Button";
import RightDrawer from "../../../components/drawer/RightDrawer";
import TextArea from "../../../components/input/TextArea";
import TextInput from "../../../components/input/TextInput";
import PageTitle from "../../../components/layout/PageTitle.tsx";

import {
    getOverheadCostPerUnit,
    getCOGS,
    getNetProfitMargin,
    getSalePrice,
    calculateMaterialCost,
    calculateTotalMaterialCost,
} from "../../../utils/pricing.ts";

import { goodsInputValidation, goodsUpdateValidation } from "@arvo/shared";
import NumberInput from "../../../components/input/NumberInput.tsx";

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
    costPerUnit: number;
    materialCost: number;
    unitAbbreviation: string;
};

interface ProductType {
    id: string;
    name: string;
}

type UserPreference = {
    profitPercentage: number;
    operatingCostPercentage: number;
    laborCost: number;
    overheadCostPercentage: number;
};

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
    const [retailPrice, setRetailPrice] = useState(0);
    const [note, setNote] = useState("");
    const [inventoryQuantity, setInventoryQuantity] = useState(0);
    const [minimumStockLevel, setMinimumStockLevel] = useState(0);
    const [mcpu, setMcpu] = useState(0);
    const [overheadCost, setOverheadCost] = useState(0);
    const [cogs, setCogs] = useState(0);
    const [netProfitMargin, setNetProfitMargin] = useState(0);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [materials, setMaterials] = useState<Materials[]>([]);
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const [editingGoodId, setEditingGoodId] = useState<string | null>(null);
    const [canSuggest, setCanSuggest] = useState(false);
    const { data, isLoading, error } = useQuery(trpc.goods.list.queryOptions());
    const { data: materialList } = useQuery(
        trpc.goods.materials.queryOptions(),
    );
    const { data: productTypesList } = useQuery(
        trpc.goods.productTypes.queryOptions(),
    ) as {
        data: ProductType[] | undefined;
    };
    const { data: userPreference } = useQuery(
        trpc.goods.userPreference.queryOptions(),
    ) as { data: UserPreference[] };
    const { data: materialOutputRatioData } = useQuery(
        trpc.goods.materialOutputRatio.queryOptions(),
    );

    const getUnusedProductTypes = () => {
        if (!productTypesList || !data) return [];

        const usedTypeIds = data.map((good) => good.typeId);
        return productTypesList.filter(
            (type) => !usedTypeIds.includes(type.id),
        );
    };

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
            render: (value) => value || "-",
        },
        {
            key: "inventoryQuantity",
            header: "Inventory Quantity",
        },
        {
            key: "retailPrice",
            header: "Unit Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "actions",
            header: "Edit",
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
        setName("");
        setProductType(productTypesList?.[0]?.id || "");
        setRetailPrice(0);
        setInventoryQuantity(0);
        setMaterials([]);
        setNote("");
        setMinimumStockLevel(0);
        setFormErrors({});
        setMcpu(0);
        setNetProfitMargin(0);
        setSuggestedPrice(0);
        setCanSuggest(false);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };

    const tabledData = (() => {
        const goodsData =
            data?.map((element) => ({
                ...element,
                actions: "",
            })) || [];

        const unusedTypes = getUnusedProductTypes();
        const emptyRows = unusedTypes.map(
            (type) =>
                ({
                    id: type.id,
                    name: "-",
                    type: type.name,
                    typeId: type.id,
                    inventoryQuantity: 0,
                    retailPrice: 0,
                    actions: "",
                }) as Goods,
        );

        return [...goodsData, ...emptyRows];
    })();

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
                    updatedMaterials[index].unitAbbreviation = (
                        chosenMaterial as MaterialWithUnit
                    ).unit.abbreviation;
                    updatedMaterials[index].costPerUnit = (
                        chosenMaterial as MaterialWithUnit
                    ).costPerUnit;
                    updatedMaterials[index].materialCost =
                        calculateMaterialCost(
                            updatedMaterials[index].amount,
                            (chosenMaterial as MaterialWithUnit).costPerUnit,
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
            setMcpu(totalCost);

            return updatedMaterials;
        });
    };

    const addGoodMutation = useMutation(
        trpc.goods.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.materialOutputRatio.queryKey(),
                });
            },
        }),
    );

    const updateGoodMutation = useMutation(
        trpc.goods.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.materialOutputRatio.queryKey(),
                });
            },
        }),
    );

    const removeMaterialRow = (index: number) => {
        setMaterials((prevMaterials) => {
            const updatedMaterials = [...prevMaterials];
            updatedMaterials.splice(index, 1);

            const totalCost = calculateTotalMaterialCost(updatedMaterials);
            setMcpu(totalCost);

            return updatedMaterials;
        });
    };

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
        // Update existing good
        if (editingGoodId) {
            const result = goodsUpdateValidation.safeParse({
                id: editingGoodId,
                name,
                productTypeId: productType,
                retailPrice,
                note,
                inventoryQuantity,
                minimumStockLevel,
                materials,
                materialCost: mcpu,
                laborCost: userPreference[0]?.laborCost || 0,
                overheadCost,
                operatingCost: userPreference[0]?.operatingCostPercentage || 0,
                netProfit: netProfitMargin,
            });

            console.log(result);
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
            updateGoodMutation.mutate(result.data);
            closeDrawer();
        } else {
            // Add new good
            const result = goodsInputValidation.safeParse({
                name,
                productTypeId: productType,
                retailPrice,
                note,
                inventoryQuantity,
                minimumStockLevel,
                materials,
                materialCost: mcpu,
                laborCost: userPreference[0]?.laborCost || 0,
                overheadCost,
                operatingCost: userPreference[0]?.operatingCostPercentage || 0,
                netProfit: netProfitMargin,
            });
            console.log(result);

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
            resetForm();
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this good?")) {
            deleteGoodMutation.mutate({ id });
            closeDrawer();
        }
    };

    const handleEdit = (good: Goods) => {
        // Check if this is an empty row (productType-only row)
        const isEmptyRow = good.name === "-";

        if (isEmptyRow) {
            // Treat as new product creation
            setEditingGoodId(null);
            setDrawerOpen(true);
            setName("");
            setProductType(good.typeId || "");
            setRetailPrice(0);
            setInventoryQuantity(0);
            setNote("");
            setMinimumStockLevel(0);
            setMcpu(0);
            setMaterials([]);
        } else {
            // Existing product editing
            setEditingGoodId(good.id);
            console.log("editingGoodId", editingGoodId);
            setDrawerOpen(true);
            setName(good.name);
            setProductType(good.typeId || "");
            setRetailPrice(good.retailPrice || 0.0);
            setInventoryQuantity(good.inventoryQuantity || 0);
            setNote(good.note || "");
            setMinimumStockLevel(good.minimumStockLevel || 0);
            setEditingGoodId(good.id);
            setMcpu(good.materialCost || 0);

            if (materialOutputRatioData) {
                const filteredMaterials = materialOutputRatioData
                    .filter((mor) => mor.id === good.id)
                    .map((mor) => ({
                        materialId: mor?.materialId || "",
                        name: mor?.materialName || "",
                        amount: mor?.input || 0,
                        unitAbbreviation: mor?.abbreviation || "",
                        costPerUnit: mor?.costPerUnit || 0,
                        materialCost: calculateMaterialCost(
                            mor?.input || 0,
                            mor?.costPerUnit || 0,
                        ),
                    }));
                setMaterials(filteredMaterials);
            } else {
                setMaterials([]);
            }
        }
    };

    useEffect(() => {
        if (productTypesList && productTypesList.length > 0 && !productType) {
            setProductType(productTypesList[0].id);
        }
    }, [productType, productTypesList]);

    useEffect(() => {
        setOverheadCost(
            getOverheadCostPerUnit(
                userPreference?.[0]?.overheadCostPercentage,
                mcpu || 0,
            ),
        );
    }, [mcpu]);

    useEffect(() => {
        setCogs(getCOGS(mcpu, userPreference?.[0]?.laborCost, overheadCost));
    }, [mcpu, overheadCost]);

    useEffect(() => {
        setNetProfitMargin(
            getNetProfitMargin(
                retailPrice,
                cogs,
                userPreference?.[0]?.operatingCostPercentage,
            ),
        );
    }, [retailPrice, cogs]);

    useEffect(() => {
        setSuggestedPrice(
            getSalePrice(
                cogs,
                userPreference?.[0]?.operatingCostPercentage,
                userPreference?.[0]?.profitPercentage,
            ),
        );
    }, [cogs]);

    useEffect(() => {
        if (productType && mcpu > 0) {
            setCanSuggest(true);
            console.log(canSuggest);
        }
    }, [mcpu, productType, setDrawerOpen]);

    return (
        <BaseLayout title="Product List">
            <div className="flex justify-between">
                <PageTitle title="Product Inventory" />
                <Button
                    value="Add Product"
                    icon="/icon/plus.svg"
                    onClick={() => setDrawerOpen(true)}
                ></Button>
            </div>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
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
                            ...(productTypesList
                                ? productTypesList.map((productType) => ({
                                      value: productType.id,
                                      label: productType.name,
                                  }))
                                : []),
                        ]}
                        onChange={(e) => setProductType(e.target.value)}
                    ></Select>

                    <NumberInput
                        label="Stock Level"
                        value={inventoryQuantity}
                        min="0"
                        step="1"
                        required={true}
                        onChange={(e) =>
                            setInventoryQuantity(Number(e.target.value))
                        }
                        error={formErrors.inventoryQuantity}
                    ></NumberInput>
                    <NumberInput
                        label="Min. Stock Level"
                        min="0"
                        step="1"
                        value={minimumStockLevel}
                        onChange={(e) =>
                            setMinimumStockLevel(Number(e.target.value))
                        }
                        error={formErrors.minimumStockLevel}
                    ></NumberInput>

                    <h4 className="font-semibold">Recipe Per Item</h4>
                    {!editingGoodId ? (
                        <Button
                            type="button"
                            value="Add Material"
                            onClick={addMaterialRow}
                        ></Button>
                    ) : (
                        ""
                    )}
                    {materials.map((row, index) => (
                        <div
                            key={index}
                            className="sm:flex gap-y-2 justify-between items-center"
                        >
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
                                disabled={!editingGoodId ? false : true}
                                onChange={(e) =>
                                    updateMaterialRow(
                                        index,
                                        "materialId",
                                        e.target.value,
                                    )
                                }
                            />

                            <NumberInput
                                label="Amount"
                                value={Number(row.amount).toFixed(2)}
                                step="0.50"
                                min="0.00"
                                unit={row.unitAbbreviation}
                                disabled={!editingGoodId ? false : true}
                                onChange={(e) =>
                                    updateMaterialRow(
                                        index,
                                        "amount",
                                        Number(e.target.value),
                                    )
                                }
                            ></NumberInput>

                            {!editingGoodId ? (
                                <button
                                    type="button"
                                    onClick={() => removeMaterialRow(index)}
                                >
                                    <img
                                        src="/icon/close.svg"
                                        alt="Close"
                                        className="w-4 cursor-pointer"
                                    />
                                </button>
                            ) : (
                                ""
                            )}
                        </div>
                    ))}
                    <NumberInput
                        label="Price (per Item)"
                        value={Number(retailPrice).toFixed(2)}
                        onChange={(e) => setRetailPrice(Number(e.target.value))}
                        step="0.50"
                        unit="$"
                        error={formErrors.retailPrice}
                        min="0"
                    ></NumberInput>
                    {userPreference ? (
                        <PriceSuggestionWidget
                            productType={productType}
                            materialCost={mcpu}
                            laborCost={userPreference?.[0].laborCost}
                            overheadCost={overheadCost}
                            operationalCost={
                                userPreference[0].operatingCostPercentage
                            }
                            profitMarginPreference={
                                userPreference[0].profitPercentage
                            }
                            canSuggest={canSuggest}
                            shouldReset={!drawerOpen}
                        />
                    ) : (
                        ""
                    )}
                    <p className="font-semibold">
                        Suggested Price:$
                        {!suggestedPrice
                            ? "0.00"
                            : suggestedPrice.toFixed(2)}{" "}
                    </p>
                    <p>
                        {" "}
                        * Based on profit percentage in user setting:
                        {userPreference?.[0].profitPercentage
                            ? userPreference[0].profitPercentage * 100
                            : "0.00"}
                        %
                    </p>
                    <h4 className="font-semibold">Cost Breakdown per Item</h4>
                    <ul>
                        <li>
                            1️⃣Total Material Cost: $
                            {!mcpu ? "0.00" : mcpu.toFixed(2)}
                        </li>
                        <li>
                            2️⃣Labor Cost : $
                            {userPreference?.[0].laborCost
                                ? userPreference[0].laborCost.toFixed(2)
                                : "0.00"}
                        </li>
                        <li>
                            3️⃣Overhead Cost : $
                            {!overheadCost ? "0.00" : overheadCost.toFixed(2)}
                        </li>
                        ----
                        <li>
                            COGS（1️⃣+2️⃣+3️⃣） : $
                            {!cogs ? "0.00" : cogs.toFixed(2)}
                        </li>
                        <li>
                            Operational Cost : $
                            {userPreference?.[0].operatingCostPercentage
                                ? userPreference[0].operatingCostPercentage.toFixed(
                                      2,
                                  )
                                : "0.00"}
                        </li>
                        ----
                        <li>
                            Net Profit Margin :
                            {!netProfitMargin
                                ? "0.00"
                                : netProfitMargin.toFixed(2)}
                            %
                        </li>
                    </ul>

                    <TextArea
                        label="Notes"
                        name="notes"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></TextArea>

                    <div
                        className={`grid ${editingGoodId && "grid-cols-2 gap-2"}`}
                    >
                        {editingGoodId && (
                            <Button
                                type="button"
                                value="Delete"
                                onClick={() => handleDelete(editingGoodId)}
                            />
                        )}
                        <Button type="submit" value="Save"></Button>
                    </div>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
