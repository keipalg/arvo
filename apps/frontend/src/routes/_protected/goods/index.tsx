import BaseLayout from "../../../components/BaseLayout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { inferRouterOutputs } from "@trpc/server";
import React, { useEffect, useState } from "react";
import Button from "../../../components/button/Button";
import AddButton from "../../../components/button/AddButton";
import { MoreButtonProvider } from "../../../components/button/MoreButtonProvider";
import { MoreButton } from "../../../components/button/MoreButton.tsx";
import UnderLinedButton from "../../../components/button/UnderLinedButton.tsx";
import RightDrawer from "../../../components/drawer/RightDrawer";
import Select from "../../../components/input/Select";
import TextArea from "../../../components/input/TextArea";
import TextInput from "../../../components/input/TextInput";
import PageTitle from "../../../components/layout/PageTitle.tsx";
import Metric from "../../../components/metric/Metric.tsx";
import CostBreakDown from "../../../components/pricing/CostBreakDown.tsx";
import ToastNotification from "../../../components/modal/ToastNotification.tsx";
import ConfirmationModal from "../../../components/modal/ConfirmationModal.tsx";
import { PriceSuggestionWidget } from "../../../components/pricing/PriceSuggestionWidget";
import DataTable, {
    type FilterOption,
} from "../../../components/table/DataTable";
import GoodDetails from "../../../components/table/DataTableDetailGood";
import { useIsSmUp } from "../../../utils/screenWidth";
import { queryClient, trpc, type AppRouter } from "../../../utils/trpcClient";

import {
    calculateMaterialCost,
    calculateTotalMaterialCost,
    getCOGS,
    getNetProfitMargin,
    getOverheadCostPerUnit,
} from "../../../utils/pricing.ts";

import { goodsInputValidation, goodsUpdateValidation } from "@arvo/shared";
import { FileInput } from "../../../components/input/FileInput.tsx";
import FormLabel from "../../../components/input/FormLabel.tsx";
import NumberInput from "../../../components/input/NumberInput.tsx";
import ProductTypeSelector from "../../../components/input/ProductTypeSelector";
import { uploadFile } from "../../../utils/fileUpload.ts";
import MetricsGroup from "../../../components/metric/MetricsGroup.tsx";
import { useDevAutofill } from "../../../hooks/useDevAutofill.ts";
import { demoData } from "../../../config/demoData.ts";

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
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false);
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data: topProductMetrics } = useQuery(
        trpc.dashboard.mostSellingProductWithComparison.queryOptions({
            timezone,
        }),
    );
    const { data: leastProductMetrics } = useQuery(
        trpc.dashboard.leastSellingProductWithComparison.queryOptions({
            timezone,
        }),
    );

    const checkProductInSalesMutation = useMutation(
        trpc.goods.checkInSales.mutationOptions({
            onSuccess: (isUsedInSales) => {
                if (isUsedInSales) {
                    setToastMessage({
                        kind: "WARN",
                        content:
                            "Cannot delete this product because it is used in sales records.",
                    });
                    setVisibleToast(true);
                } else {
                    deleteGoodMutation.mutate({ id: itemToDelete! });
                }
                setItemToDelete(null);
                setIsConfirmationModalOpen(false);
                closeDrawer();
            },
        }),
    );

    const isSmUp = useIsSmUp();

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
                    <div className="h-16 w-24 flex justify-center m-auto rounded">
                        {value ? (
                            <img
                                src={value as string}
                                alt="Product"
                                className="h-16 w-24 object-cover rounded"
                            />
                        ) : (
                            <img
                                src="/icon/icon-photo.svg"
                                alt="No Image"
                                className="h-16 w-24 object-contain"
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
        },
        {
            key: "inventoryQuantity",
            header: "Stock Level",
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
                    <MoreButton
                        id={row.id}
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
        setProductType("");
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
        resetForm();
    };

    const tabledData = (() => {
        const goodsData =
            data?.map((element) => ({
                ...element,
                actions: "",
            })) || [];

        return [...goodsData];
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
                setToastMessage({
                    kind: "SUCCESS",
                    content: `Added product successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error adding product: ${error.message}`,
                });
                setVisibleToast(true);
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
                setToastMessage({
                    kind: "SUCCESS",
                    content: `Updated successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error updateing product: ${error.message}`,
                });
                setVisibleToast(true);
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
                setToastMessage({
                    kind: "SUCCESS",
                    content: `Deleted successfully!`,
                });
                setVisibleToast(true);
            },
            onError: (error) => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error deleting product: ${error.message}`,
                });
                setVisibleToast(true);
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
        setItemToDelete(id);
        setIsConfirmationModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            checkProductInSalesMutation.mutate({ id: itemToDelete });
        }
    };

    const handleEdit = (good: Goods) => {
        // Existing product editing
        setEditingGoodId(good.id);
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
    };

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

    // ===========================================================
    // START: Code for Dev Autofill
    // ===========================================================
    useDevAutofill(() => {
        if (!drawerOpen || editingGoodId) return;

        const config = demoData.goods;

        // Autofill basic fields only if provided
        if (config.name !== undefined) setName(config.name);
        if (config.inventoryQuantity !== undefined)
            setInventoryQuantity(config.inventoryQuantity);
        if (config.minimumStockLevel !== undefined)
            setMinimumStockLevel(config.minimumStockLevel);
        if (config.retailPrice !== undefined)
            setRetailPrice(config.retailPrice);
        if (config.note !== undefined) setNote(config.note);

        // Autofill image from public folder
        if (config.image !== undefined) {
            void fetch(config.image)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], "product-demo.webp", {
                        type: "image/webp",
                    });
                    setProductImage(file);
                })
                .catch((err) => {
                    console.error("[DEV] Failed to load demo image:", err);
                });
        }

        // Find and set product type by name
        if (config.productType && productTypesList) {
            const matchingProductType = productTypesList.find((type) =>
                type.name
                    .toLowerCase()
                    .includes(config.productType!.toLowerCase()),
            );
            if (matchingProductType) {
                setProductType(matchingProductType.id);
            }
        }

        // Autofill materials only if provided
        if (config.materials && config.materials.length > 0) {
            const demoMaterials: Materials[] = [];
            let totalMaterialCost = 0;

            for (const configMaterial of config.materials as Array<{
                name: string;
                amount: number;
            }>) {
                // Find matching material from the list
                const matchingMaterial = (materialList || []).find((mat) => {
                    const matWithUnit = mat as MaterialWithUnit;
                    return matWithUnit.name
                        .toLowerCase()
                        .includes(configMaterial.name.toLowerCase());
                }) as MaterialWithUnit | undefined;

                if (matchingMaterial) {
                    const materialCost = calculateMaterialCost(
                        configMaterial.amount,
                        matchingMaterial.costPerUnit,
                    );

                    demoMaterials.push({
                        materialId: matchingMaterial.id,
                        name: matchingMaterial.name,
                        amount: configMaterial.amount,
                        unitAbbreviation: matchingMaterial.unit.abbreviation,
                        costPerUnit: matchingMaterial.costPerUnit,
                        materialCost: materialCost,
                    });

                    totalMaterialCost += materialCost;
                }
            }

            // Update materials states if matches found
            if (demoMaterials.length > 0) {
                setMaterials(demoMaterials);
                setMcpu(totalMaterialCost);
            }
        }
    }, [drawerOpen, editingGoodId, productTypesList, materialList]);
    // ===========================================================
    // END: Code for Dev Autofill
    // ===========================================================

    return (
        <BaseLayout title="Product List">
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
            <ConfirmationModal
                confirmationMessage={`Are you sure you want to delete this product?`}
                isConfirmationModalOpen={isConfirmationModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                onConfirm={confirmDelete}
            />
            <div className="flex justify-between gap-2">
                <PageTitle
                    title="Product List"
                    info="This is your product inventory page. You can manage and see all your products details, price, stock level, and material used all at once"
                />
                <AddButton
                    value="Add Product"
                    icon="/icon/plus.svg"
                    onClick={() => handleAddGood()}
                ></AddButton>
            </div>

            <MetricsGroup>
                {topProductMetrics ? (
                    <Metric
                        value={topProductMetrics.productName}
                        changePercent={topProductMetrics.percentageChange}
                        topText="Most Sold Item This Month"
                        bottomText="than last month"
                    ></Metric>
                ) : (
                    ""
                )}
                {leastProductMetrics ? (
                    <Metric
                        value={leastProductMetrics.productName}
                        changePercent={leastProductMetrics.percentageChange}
                        topText="Least Sold Item This Month"
                        bottomText="than last month"
                    ></Metric>
                ) : (
                    ""
                )}
            </MetricsGroup>

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
                                key: "createdAt",
                                label: "Oldest → Newest",
                                order: "asc",
                            },
                            {
                                key: "createdAt",
                                label: "Newest → Oldest",
                                order: "desc",
                            },
                            {
                                key: "inventoryQuantity",
                                label: "Stock (Highest → Lowest)",
                                order: "desc",
                            },
                            {
                                key: "inventoryQuantity",
                                label: "Stock (Lowest → Highest)",
                                order: "asc",
                            },
                        ]}
                        searchOption={{
                            key: "name",
                            label: "Product Name",
                        }}
                    />
                </MoreButtonProvider>
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
                            setProductImage(e.target.files?.[0] ?? null)
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
                            error={formErrors.productTypeId}
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
                                        <NumberInput
                                            value={row.amount}
                                            step="0.01"
                                            min="0.00"
                                            unit={row.unitAbbreviation}
                                            unitPosition="right"
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
                                        ></NumberInput>
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
                            <div className="col-span-2 grid grid-cols-2 align-middle">
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
                                {formErrors.materials && (
                                    <div className="text-red-500 text-sm translate-y-1">
                                        {formErrors.materials}
                                    </div>
                                )}
                            </div>
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
                            isLabel={true}
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
                                <Button
                                    type="button"
                                    value="Delete"
                                    onClick={() => handleDelete(editingGoodId)}
                                />
                            )}
                            <Button type="submit" value="Save"></Button>
                        </div>
                    </div>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
