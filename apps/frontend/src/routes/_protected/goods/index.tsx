import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { trpc, queryClient, type AppRouter } from "../../../utils/trpcClient";
import DataTable, {
    type FilterOption,
} from "../../../components/table/DataTable";
import DataTable, {
    type FilterOption,
} from "../../../components/table/DataTable";
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
import UnderLinedButton from "../../../components/button/UnderLinedButton.tsx";
import WeightWithUnit from "../../../components/input/WeightWithUnit.tsx";
import CostBreakDown from "../../../components/pricing/CostBreakDown.tsx";
import Metric from "../../../components/metric/Metric.tsx";
import { useIsSmUp } from "../../../utils/screenWidth";
import GoodDetails from "../../../components/table/DataTableDetailGood";
import { MoreButton } from "../../../components/button/MoreButton.tsx";

import {
    getOverheadCostPerUnit,
    getCOGS,
    getNetProfitMargin,
    calculateMaterialCost,
    calculateTotalMaterialCost,
} from "../../../utils/pricing.ts";

import { goodsInputValidation, goodsUpdateValidation } from "@arvo/shared";
import NumberInput from "../../../components/input/NumberInput.tsx";
import ProductTypeSelector from "../../../components/input/ProductTypeSelector";
import { FileInput } from "../../../components/input/FileInput.tsx";
import { uploadFile } from "../../../utils/fileUpload.ts";
import FormLabel from "../../../components/input/FormLabel.tsx";

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
    const [editingGoodId, setEditingGoodId] = useState<string | null>(null);
    const [canSuggest, setCanSuggest] = useState(false);
    const [productImage, setProductImage] = useState<File | string | null>(
        null,
    );
    const [deleteError, setDeleteError] = useState<string | null>(null);

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

    const isSmUp = useIsSmUp();

    const getUnusedProductTypes = () => {
        if (!productTypesList || !data) return [];

        const usedTypeIds = data.map((good) => good.typeId);
        return productTypesList.filter(
            (type) => !usedTypeIds.includes(type.id),
        );
    };

    console.log("goods", data);

    const columns: Array<{
        key: keyof Goods;
        header: string;
        render?: (value: Goods[keyof Goods], row: Goods) => React.ReactNode;
    }> = [
        {
            key: "image",
            header: "Product Photo",
            render: (value) => {
                return (
                    <div className="h-14 flex justify-center  rounded">
                        {value ? (
                            <img
                                src={value as string}
                                alt="Product"
                                className="h-14 object-cover rounded"
                            />
                        ) : (
                            <img
                                src="/icon/icon-photo.svg"
                                alt="No Image"
                                className="h-14"
                            />
                        )}
                    </div>
                );
            },
        },
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

    const detailsRender = (row: Goods) => {
        const defaultMobileSet = new Set<keyof Goods>();
        if (columns[0]) defaultMobileSet.add(columns[0].key);
        if (columns[1]) defaultMobileSet.add(columns[1].key);
        const actionsCol = columns.find((c) => String(c.key) === "actions");
        if (actionsCol) defaultMobileSet.add(actionsCol.key);

        const mobileSet = new Set<keyof Goods>(Array.from(defaultMobileSet));

        const visibleMobileColumnsCount = columns.filter((c) =>
            mobileSet.has(c.key),
        ).length;

        return (
            <GoodDetails
                row={row}
                columnsLength={columns.length}
                visibleMobileColumnsCount={visibleMobileColumnsCount}
                isSmUp={isSmUp}
            />
        );
    };

    const tableFilterOptions: FilterOption<Goods>[] = [
        {
            key: "type",
            label: "Product Type",
            values:
                productTypesList?.map((t) => ({
                    key: String(t.name),
                    label: String(t.name),
                })) ?? [],
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
        setCanSuggest(false);
        setProductImage(null);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setDeleteError(null);
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

            if (totalCost === 0) {
                setCanSuggest(false);
            }

            return updatedMaterials;
        });
    };

    const deleteGoodMutation = useMutation(
        trpc.goods.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.goods.list.queryKey(),
                });
                setDeleteError(null);
            },
            onError: () => {
                setDeleteError(
                    "You can't delete. This record have been used in sales record.",
                );
            },
        }),
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let productImageUrl: string | undefined = undefined;
        if (productImage instanceof File) {
            productImageUrl = await uploadFile(productImage);
        } else if (typeof productImage === "string") {
            productImageUrl = productImage;
        } else if (editingGoodId && productImage === undefined) {
            productImageUrl = "";
        }

        // Update existing good
        if (editingGoodId) {
            const result = goodsUpdateValidation.safeParse({
                id: editingGoodId,
                image: productImageUrl,
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
                image: productImageUrl,
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

    const handleAddGood = () => {
        setDrawerOpen(true);
        addMaterialRow();
        setEditingGoodId("");
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this good?")) {
            setDeleteError(null);
            deleteGoodMutation.mutate({ id });
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
            setProductImage(null);
            addMaterialRow();
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
            setProductImage(good.image || null);

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
        if (productType && mcpu > 0) {
            setCanSuggest(true);
            console.log(canSuggest);
        }
    }, [mcpu, productType, setDrawerOpen]);

    return (
        <BaseLayout title="Product List">
            <div className="flex justify-between">
                <PageTitle
                    title="Product Inventory"
                    info="This is your product inventory page. You can manage and see all your products details, price, stock level, and material used all at once"
                />
                <Button
                    value="Add Product"
                    icon="/icon/plus.svg"
                    onClick={() => handleAddGood()}
                ></Button>
            </div>
            <div className="flex gap-6 py-2">
                <Metric
                    value={`${String(7)} items`}
                    changePercent={-5}
                    topText="Most sold item"
                    bottomText="than last month"
                ></Metric>
                <Metric
                    value={`${String(7)} items`}
                    changePercent={-5}
                    topText="Least sold item"
                    bottomText="than last month"
                ></Metric>
            </div>

            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable
                    columns={columns}
                    data={tabledData || []}
                    filterOptions={tableFilterOptions}
                    detailRender={detailsRender}
                    sortOptions={[
                        {
                            key: "createdAt",
                            label: "Date Created (Oldest → Newest)",
                            order: "asc",
                        },
                        {
                            key: "createdAt",
                            label: "Date Created (Newest → Oldest)",
                            order: "desc",
                        },
                        {
                            key: "inventoryQuantity",
                            label: "Quantity (Highest → Lowest)",
                            order: "desc",
                        },
                        {
                            key: "inventoryQuantity",
                            label: "Quantity (Lowest → Highest)",
                            order: "asc",
                        },
                    ]}
                />
            )}
            <RightDrawer
                narrower={true}
                title={
                    !editingGoodId ? "Add New Product" : "Edit Product Detail"
                }
                isOpen={drawerOpen}
                onClose={() => closeDrawer()}
            >
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <FileInput
                        label="Product Image"
                        file={productImage || undefined}
                        onChange={(e) =>
                            setProductImage(e.target.files?.[0] ?? undefined)
                        }
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <TextInput
                            label="Product Name"
                            required={true}
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={formErrors.name}
                        ></TextInput>
                        <ProductTypeSelector
                            label="Product Type"
                            required={true}
                            value={productType}
                            onChange={setProductType}
                            error={formErrors.productType}
                        />
                        <NumberInput
                            label="Stock Level"
                            value={inventoryQuantity}
                            min="0"
                            step="1"
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
                        <div className="col-span-2 grid gap-2">
                            <FormLabel
                                label="Material per Item"
                                required={true}
                                info="Enter the materials used to make this product. The system will automatically calculate costs and suggest an appropriate product unit price."
                            />

                            {materials.map((row, index) => (
                                <div
                                    key={index}
                                    className="col-span-2 grid grid-cols-2 gap-1.5"
                                >
                                    <Select
                                        value={row.materialId}
                                        options={[
                                            { value: "", label: "" },
                                            ...(materialList?.map(
                                                (material) => ({
                                                    value: material.id,
                                                    label: material.name,
                                                }),
                                            ) || []),
                                        ]}
                                        disabled={!editingGoodId ? false : true}
                                        style="top-1/3"
                                        onChange={(e) =>
                                            updateMaterialRow(
                                                index,
                                                "materialId",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <div className=" grid grid-cols-[85%_15%] gap-2">
                                        <WeightWithUnit
                                            value={row.amount}
                                            step="0.01"
                                            min="0.00"
                                            unit={row.unitAbbreviation}
                                            disabled={
                                                !editingGoodId ? false : true
                                            }
                                            onChange={(e) =>
                                                updateMaterialRow(
                                                    index,
                                                    "amount",
                                                    Number(e.target.value),
                                                )
                                            }
                                        ></WeightWithUnit>
                                        {!editingGoodId ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMaterialRow(index)
                                                }
                                            >
                                                <img
                                                    src="/icon/close.svg"
                                                    alt="Close"
                                                    className="w-4  cursor-pointer pb-2"
                                                />
                                            </button>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!editingGoodId ? (
                                <UnderLinedButton
                                    type="button"
                                    value="Add Material"
                                    icon="/icon/plus-blue.svg"
                                    onClick={addMaterialRow}
                                ></UnderLinedButton>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <NumberInput
                            label="Unit Price*"
                            value={retailPrice}
                            onChange={(e) =>
                                setRetailPrice(Number(e.target.value))
                            }
                            step="0.01"
                            unit="$"
                            error={formErrors.retailPrice}
                            min="0"
                        ></NumberInput>
                    </div>
                    {userPreference ? (
                        <div className="py-3">
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
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="grid col-auto gap-3">
                        <CostBreakDown
                            mor={!mcpu ? "0.00" : mcpu.toFixed(2)}
                            cogs={!cogs ? "0.00" : cogs.toFixed(2)}
                            operatingCosts={
                                userPreference?.[0].operatingCostPercentage
                                    ? userPreference[0].operatingCostPercentage.toFixed(
                                          2,
                                      )
                                    : "0.00"
                            }
                            profitMargin={
                                !netProfitMargin
                                    ? "0.00"
                                    : netProfitMargin.toFixed(2)
                            }
                        />
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
                                <div className="grid">
                                    {deleteError && (
                                        <div className="mb-1 p-2 text-red-700 rounded">
                                            {deleteError}
                                        </div>
                                    )}
                                    <Button
                                        type="button"
                                        value="Delete"
                                        onClick={() =>
                                            handleDelete(editingGoodId)
                                        }
                                    />
                                </div>
                            )}
                            <Button type="submit" value="Save"></Button>
                        </div>
                    </div>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
