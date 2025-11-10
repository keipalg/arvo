import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import DataTable, {
    type FilterOption,
} from "../../../components/table/DataTable";
import {
    queryClient,
    trpc,
    trpcClient,
    type AppRouter,
} from "../../../utils/trpcClient";

import {
    addMaterialsValidation,
    updateMaterialsValidation,
} from "@arvo/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { useEffect, useState } from "react";
import InventoryStatus from "../../../components/badge/InventoryStatus";
import AddButton from "../../../components/button/AddButton";
import Button from "../../../components/button/Button";
import { MoreButton } from "../../../components/button/MoreButton";
import RightDrawer from "../../../components/drawer/RightDrawer";
import DisplayValue from "../../../components/input/DisplayValue";
import MaterialTypeSelector from "../../../components/input/MaterialTypeSelector";
import NumberInput from "../../../components/input/NumberInput";
import Select from "../../../components/input/Select";
import TextArea from "../../../components/input/TextArea";
import TextInput from "../../../components/input/TextInput";
import PageTitle from "../../../components/layout/PageTitle";
import Metric from "../../../components/metric/Metric";
import ConfirmationModal from "../../../components/modal/ConfirmationModal";
import ToastNotification from "../../../components/modal/ToastNotification";
import MaterialDetails from "../../../components/table/DataTableDetailMaterial";
import { useIsSmUp } from "../../../utils/screenWidth";

export const Route = createFileRoute("/_protected/materials/")({
    component: MaterialsList,
});

type Materials = inferRouterOutputs<AppRouter>["materials"]["list"][number] & {
    actions: string;
};

function MaterialsList() {
    const tooltip =
        "Materials are raw items that go into direct creation of your product.";
    const [itemName, setItemName] = useState("");
    const [materialType, setMaterialType] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [minStockLevel, setMinStockLevel] = useState(0);
    const [costPerUnit, setCostPerUnit] = useState(0);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [unit, setUnit] = useState("");
    const [unitAbbreviation, setUnitAbbreviation] = useState("");
    const [lastPurchaseDate, setLastPurchaseDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [supplierUrl, setSupplierUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
        null,
    );

    // For edit mode - Update Material Pricing section
    const [showUpdatePricing, setShowUpdatePricing] = useState(false);
    const [bulkPurchasePrice, setBulkPurchasePrice] = useState(0);
    const [bulkPurchaseQuantity, setBulkPurchaseQuantity] = useState(0);
    const [newCostPerUnit, setNewCostPerUnit] = useState(0);
    const [originalCostPerUnit, setOriginalCostPerUnit] = useState(0);
    const [pricingUpdated, setPricingUpdated] = useState(false);
    const [createdAt, setCreatedAt] = useState("N/A");
    const [updatedAt, setUpdatedAt] = useState("N/A");

    // Confirmation modal and toast states
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isPriceUpdateModalOpen, setIsPriceUpdateModalOpen] = useState(false);
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({
        kind: "",
        content: "",
    });

    const { data: unitsList } = useQuery(trpc.units.list.queryOptions());
    const { data: materialTypesList } = useQuery(
        trpc.materialTypes.list.queryOptions(),
    );
    const { data, isLoading, error } = useQuery(
        trpc.materials.list.queryOptions(),
    );

    // Insights queries
    const { data: mostUsedMaterialData } = useQuery(
        trpc.materials.mostUsedMaterial.queryOptions(),
    );
    const { data: lowStockData } = useQuery(
        trpc.materials.lowStockCount.queryOptions(),
    );
    const { data: totalInventoryValueData } = useQuery(
        trpc.materials.totalInventoryValue.queryOptions(),
    );

    const isSmUp = useIsSmUp();

    const detailsRender = (row: Materials) => {
        const defaultMobileSet = new Set<keyof Materials>();
        if (columns[0]) defaultMobileSet.add(columns[0].key);
        if (columns[1]) defaultMobileSet.add(columns[1].key);
        const actionsCol = columns.find((c) => String(c.key) === "actions");
        if (actionsCol) defaultMobileSet.add(actionsCol.key);

        const mobileSet = new Set<keyof Materials>(
            Array.from(defaultMobileSet),
        );

        const visibleMobileColumnsCount = columns.filter((c) =>
            mobileSet.has(c.key),
        ).length;

        return (
            <MaterialDetails
                row={row}
                columnsLength={columns.length}
                visibleMobileColumnsCount={visibleMobileColumnsCount}
                isSmUp={isSmUp}
            />
        );
    };

    const columns: Array<{
        key: keyof Materials;
        header: string;
        render?: (
            value: Materials[keyof Materials],
            row: Materials,
        ) => React.ReactNode;
    }> = [
        { key: "name", header: "Material Item" },
        { key: "materialType", header: "Material Type" },
        { key: "formattedQuantity", header: "Quantity" },
        {
            key: "costPerUnit",
            header: "Unit Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "status",
            header: "Status",
            render: (value) => {
                return typeof value === "string" ? (
                    <InventoryStatus statusKey={String(value)} />
                ) : (
                    <></>
                );
            },
        },
        {
            key: "actions",
            header: "Edit",
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

    const resetForm = () => {
        setItemName("");
        setMaterialType("");
        setQuantity(0);
        setMinStockLevel(0);
        setCostPerUnit(0);
        setPurchasePrice(0);
        setUnit("");
        setUnitAbbreviation("");
        setLastPurchaseDate("");
        setSupplier("");
        setSupplierUrl("");
        setNotes("");
        setFormErrors({});
        setEditingMaterialId(null);
        setShowUpdatePricing(false);
        setBulkPurchasePrice(0);
        setBulkPurchaseQuantity(0);
        setNewCostPerUnit(0);
        setOriginalCostPerUnit(0);
        setPricingUpdated(false);
        setCreatedAt("N/A");
        setUpdatedAt("N/A");
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };

    const handleEdit = (material: Materials) => {
        setEditingMaterialId(material.id);
        setItemName(material.name);
        setMaterialType(material.materialTypeId);
        setQuantity(material.quantity);
        setMinStockLevel(material.threshold || 0);

        const currentCostPerUnit = Number(material.costPerUnit) || 0;
        setCostPerUnit(currentCostPerUnit);
        setOriginalCostPerUnit(currentCostPerUnit);

        setPurchasePrice(Number(material.purchasePrice) || 0);
        setBulkPurchasePrice(Number(material.purchasePrice) || 0);
        setBulkPurchaseQuantity(Number(material.purchaseQuantity) || 0);

        setUnit(material.unitName);
        setUnitAbbreviation(material.unitAbbreviation);
        setLastPurchaseDate(
            material.lastPurchaseDate
                ? new Date(material.lastPurchaseDate)
                      .toISOString()
                      .split("T")[0]
                : "",
        );
        setSupplier(material.supplier || "");
        setSupplierUrl(String(material.supplierUrl || ""));
        setNotes(material.notes || "");

        const materialCreatedAt = (material as Record<string, unknown>)
            .createdAt;
        setCreatedAt(
            materialCreatedAt !== undefined
                ? new Date(materialCreatedAt as string | Date).toLocaleString()
                : "N/A",
        );
        setUpdatedAt(
            material.lastUpdatedDate
                ? new Date(material.lastUpdatedDate).toLocaleString()
                : "N/A",
        );
        setDrawerOpen(true);
    };

    const statusOrder = {
        outOfStock: 0,
        lowStock: 1,
        sufficient: 2,
    };

    const tabledData = data?.map((element) => ({
        ...element,
        actions: "",
        statusPriority:
            statusOrder[element.status as keyof typeof statusOrder] ?? 3,
    }));

    const tableFilterOptions: FilterOption<Materials>[] = [
        {
            key: "status",
            label: "Status",
            values: [
                { key: "outOfStock", label: "Out of Stock" },
                { key: "lowStock", label: "Low Stock" },
                { key: "sufficient", label: "Sufficient" },
            ],
        },
        {
            key: "materialType",
            label: "Material Type",
            values:
                materialTypesList?.map((mt) => ({
                    key: String(mt.name),
                    label: String(mt.name),
                })) ?? [],
        },
    ];

    const addMaterialMutation = useMutation(
        trpc.materials.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materialTypes.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.mostUsedMaterial.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.lowStockCount.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.totalInventoryValue.queryKey(),
                });

                setToastMessage({
                    kind: "SUCCESS",
                    content: "Success! Material has been added.",
                });
                setVisibleToast(true);
            },
        }),
    );

    const updateMaterialMutation = useMutation(
        trpc.materials.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materialTypes.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.notification.unreadCount.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.mostUsedMaterial.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.lowStockCount.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.totalInventoryValue.queryKey(),
                });

                setToastMessage({
                    kind: "SUCCESS",
                    content: "Success! Material has been updated.",
                });
                setVisibleToast(true);
            },
        }),
    );

    const deleteMaterialMutation = useMutation(
        trpc.materials.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.list.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.mostUsedMaterial.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.lowStockCount.queryKey(),
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.totalInventoryValue.queryKey(),
                });
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMaterialId) {
            // Update existing material
            const updatePayload = {
                id: editingMaterialId,
                name: itemName,
                typeId: materialType,
                unit,
                quantity,
                minStockLevel,
                lastPurchaseDate,
                supplierName: supplier,
                supplierUrl: supplierUrl,
                notes,
                // Only include purchasePrice and purchaseQuantity if pricing was updated
                ...(pricingUpdated && {
                    purchasePrice: bulkPurchasePrice,
                    purchaseQuantity: bulkPurchaseQuantity,
                }),
            };

            const result = updateMaterialsValidation.safeParse(updatePayload);

            setFormErrors({});
            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                setFormErrors(errors);
                return;
            }

            // Check if pricing was updated and show confirmation modal
            if (pricingUpdated) {
                setIsPriceUpdateModalOpen(true);
            } else {
                updateMaterialMutation.mutate(result.data);
                closeDrawer();
            }
        } else {
            // Add new material
            const result = addMaterialsValidation.safeParse({
                name: itemName,
                typeId: materialType,
                unit,
                quantity,
                purchasePrice,
                minStockLevel,
                lastPurchaseDate,
                supplierName: supplier,
                supplierUrl: supplierUrl,
                notes,
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
            addMaterialMutation.mutate(result.data);
            closeDrawer();
        }
    };

    const handleDelete = (id: string) => {
        // Find the material name
        const material = data?.find((m) => m.id === id);
        if (!material) return;

        // Set material to delete and open confirmation modal
        setMaterialToDelete({ id, name: material.name });
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!materialToDelete) return;

        // Check if material is being used
        void trpcClient.materials.checkUsage
            .query({ id: materialToDelete.id })
            .then((usageCheck) => {
                if (usageCheck.isUsed) {
                    setToastMessage({
                        kind: "WARN",
                        content: `${materialToDelete.name} is currently being used in product recipes and cannot be deleted.`,
                    });
                    setVisibleToast(true);
                } else {
                    deleteMaterialMutation.mutate({ id: materialToDelete.id });
                    setToastMessage({
                        kind: "SUCCESS",
                        content: `${materialToDelete.name} successfully deleted`,
                    });
                    setVisibleToast(true);
                    closeDrawer();
                }

                // Clean up
                setMaterialToDelete(null);
            });
    };

    const handleConfirmPriceUpdate = () => {
        if (!editingMaterialId) return;

        const updatePayload = {
            id: editingMaterialId,
            name: itemName,
            typeId: materialType,
            unit,
            quantity,
            minStockLevel,
            lastPurchaseDate,
            supplierName: supplier,
            supplierUrl: supplierUrl,
            notes,
            ...(pricingUpdated && {
                purchasePrice: bulkPurchasePrice,
                purchaseQuantity: bulkPurchaseQuantity,
            }),
        };

        const result = updateMaterialsValidation.safeParse(updatePayload);

        if (result.success) {
            updateMaterialMutation.mutate(result.data);
            closeDrawer();
        }
    };

    // Handle Save New Pricing button click
    const handleSaveNewPricing = () => {
        if (bulkPurchasePrice <= 0 || bulkPurchaseQuantity <= 0) {
            const errors: Record<string, string> = {};
            if (bulkPurchasePrice <= 0) {
                errors.bulkPurchasePrice =
                    "New Purchase Price must be greater than zero";
            }
            if (bulkPurchaseQuantity <= 0) {
                errors.bulkPurchaseQuantity =
                    "New Quantity Per Purchase must be greater than zero";
            }
            setFormErrors(errors);
            return;
        }

        const computed = bulkPurchasePrice / bulkPurchaseQuantity;
        setNewCostPerUnit(computed);

        if (computed !== originalCostPerUnit) {
            setCostPerUnit(computed);
            setPricingUpdated(true);
        }

        setShowUpdatePricing(false);
    };

    // Handle Cancel Update Pricing button click
    const handleCancelUpdatePricing = () => {
        // Reset to original values
        setBulkPurchasePrice(purchasePrice);
        setBulkPurchaseQuantity(
            Number(
                data?.find((m) => m.id === editingMaterialId)?.purchaseQuantity,
            ) || 0,
        );
        setNewCostPerUnit(0);
        setShowUpdatePricing(false);
    };

    // Auto-compute Cost Per Unit for Add mode
    useEffect(() => {
        if (!editingMaterialId && quantity > 0) {
            const computed = purchasePrice / quantity;
            setCostPerUnit(computed);
        }
    }, [purchasePrice, quantity, editingMaterialId]);

    // Auto-compute New Cost Per Unit when bulk pricing values change
    useEffect(() => {
        if (bulkPurchaseQuantity > 0) {
            const computed = bulkPurchasePrice / bulkPurchaseQuantity;
            setNewCostPerUnit(computed);
        }
    }, [bulkPurchasePrice, bulkPurchaseQuantity]);

    useEffect(() => {
        if (unitsList && unitsList.length > 0 && !unit) {
            setUnit(unitsList[0].name);
            setUnitAbbreviation(unitsList[0].abv);
        }
    }, [unitsList, unit]);

    // Set default date to today when opening drawer for adding new material
    useEffect(() => {
        if (drawerOpen && !editingMaterialId && !lastPurchaseDate) {
            const today = new Date().toISOString().split("T")[0];
            setLastPurchaseDate(today);
        }
    }, [drawerOpen, editingMaterialId, lastPurchaseDate]);

    return (
        <BaseLayout title="Materials List">
            {error && <div>Error: {error.message}</div>}
            <div className="flex justify-between gap-2">
                <PageTitle title="My Materials" info={tooltip} />
                <AddButton
                    value="Add New Material"
                    onClick={() => setDrawerOpen(true)}
                    icon="/icon/plus.svg"
                ></AddButton>
            </div>
            <div className="flex gap-6 py-2">
                <Metric
                    value={
                        mostUsedMaterialData &&
                        "materialName" in mostUsedMaterialData &&
                        mostUsedMaterialData.materialName
                            ? mostUsedMaterialData.materialName
                            : "No material usage yet"
                    }
                    changePercent={
                        mostUsedMaterialData &&
                        "percentageChange" in mostUsedMaterialData
                            ? Number(mostUsedMaterialData.percentageChange)
                            : 0
                    }
                    topText="Most Used Material"
                    bottomText={
                        mostUsedMaterialData &&
                        "materialName" in mostUsedMaterialData &&
                        mostUsedMaterialData.materialName
                            ? "Compared to last month"
                            : "No existing data"
                    }
                    showPercentage={mostUsedMaterialData?.materialName !== null}
                />

                <Metric
                    value={String(
                        lowStockData && "count" in lowStockData
                            ? lowStockData.count
                            : 0,
                    )}
                    changePercent={0}
                    topText="Materials Low on Stock"
                    bottomText="material/s need to be restocked"
                    showPercentage={false}
                    styleOverride={
                        lowStockData &&
                        "count" in lowStockData &&
                        lowStockData.count >= 1
                            ? "negative"
                            : "positive"
                    }
                />
                <Metric
                    value={
                        totalInventoryValueData &&
                        "currentValue" in totalInventoryValueData
                            ? `$${Number(totalInventoryValueData.currentValue).toFixed(2)}`
                            : "$0.00"
                    }
                    changePercent={
                        totalInventoryValueData &&
                        "percentageChange" in totalInventoryValueData
                            ? Number(totalInventoryValueData.percentageChange)
                            : 0
                    }
                    topText="Total Inventory Value"
                    bottomText={
                        totalInventoryValueData &&
                        "lastMonthValue" in totalInventoryValueData &&
                        totalInventoryValueData.lastMonthValue > 0
                            ? "Compared to last month"
                            : "No data for previous month"
                    }
                    showPercentage={
                        totalInventoryValueData &&
                        "lastMonthValue" in totalInventoryValueData &&
                        totalInventoryValueData.lastMonthValue > 0
                    }
                />
            </div>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <DataTable
                    columns={columns}
                    data={tabledData || []}
                    detailRender={detailsRender}
                    mobileVisibleKeys={["name", "materialType", "actions"]}
                    sortOptions={[
                        {
                            key: "statusPriority",
                            label: "Status (Out of Stock → Sufficient)",
                            order: "asc",
                        },
                        {
                            key: "statusPriority",
                            label: "Status (Sufficient → Out of Stock)",
                            order: "desc",
                        },
                        {
                            key: "name",
                            label: "Material Item (A → Z)",
                            order: "asc",
                        },
                        {
                            key: "name",
                            label: "Material Item (Z → A)",
                            order: "desc",
                        },
                        {
                            key: "materialType",
                            label: "Material Type (A → Z)",
                            order: "asc",
                        },
                        {
                            key: "materialType",
                            label: "Material Type (Z → A)",
                            order: "desc",
                        },
                    ]}
                    filterOptions={tableFilterOptions}
                />
            )}
            <RightDrawer
                isOpen={drawerOpen}
                onClose={() => closeDrawer()}
                narrower={true}
            >
                <h2 className="text-2xl font-bold mb-4">
                    {editingMaterialId ? "Edit a Material" : "Add a Material"}
                </h2>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <TextInput
                        label="Material Item*"
                        name="name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        error={formErrors.name}
                        placeholder="Item"
                    ></TextInput>
                    <MaterialTypeSelector
                        label="Material Type*"
                        value={materialType}
                        onChange={setMaterialType}
                        error={formErrors.typeId}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <NumberInput
                            label="Quantity*"
                            name="quantity"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Number(e.target.value))
                            }
                            error={formErrors.quantity}
                            min="0"
                            step="0.01"
                        ></NumberInput>
                        <Select
                            label="Unit*"
                            name="unit"
                            style="top-3/5"
                            value={unit}
                            optgroup={
                                unitsList
                                    ? Object.entries(
                                          unitsList.reduce(
                                              (acc, unitsOption) => {
                                                  const category =
                                                      unitsOption.cat;
                                                  if (!acc[category]) {
                                                      acc[category] = [];
                                                  }
                                                  acc[category].push({
                                                      value: unitsOption.name,
                                                      label: `${unitsOption.name} (${unitsOption.abv})`,
                                                  });
                                                  return acc;
                                              },
                                              {} as Record<
                                                  string,
                                                  Array<{
                                                      value: string;
                                                      label: string;
                                                  }>
                                              >,
                                          ),
                                      ).map(([category, options]) => ({
                                          optGroupLabel:
                                              category.charAt(0).toUpperCase() +
                                              category.slice(1),
                                          optGroupValues: options,
                                      }))
                                    : []
                            }
                            onChange={(e) => {
                                const selectedUnitName = e.target.value;
                                setUnit(selectedUnitName);
                                const selectedUnit = unitsList?.find(
                                    (u) => u.name === selectedUnitName,
                                );
                                if (selectedUnit) {
                                    setUnitAbbreviation(selectedUnit.abv);
                                }
                            }}
                        ></Select>
                    </div>
                    {/* Pricing Fields - Different for Add vs Edit mode */}
                    {editingMaterialId ? (
                        // Edit Mode
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                <DisplayValue label="Unit Price" unit="$">
                                    {costPerUnit.toFixed(2)}
                                    {pricingUpdated && (
                                        <span className="text-sm text-arvo-black-50 ml-2">
                                            <br /> (updated from $
                                            {originalCostPerUnit.toFixed(2)})
                                        </span>
                                    )}
                                </DisplayValue>
                                <DisplayValue label="Inventory Value" unit="$">
                                    {(costPerUnit * quantity).toFixed(2)}
                                </DisplayValue>
                            </div>
                            {!showUpdatePricing ? (
                                <button
                                    type="button"
                                    onClick={() => setShowUpdatePricing(true)}
                                    className="text-left text-arvo-blue-100 hover:text-arvo-blue-80 underline mb-4"
                                >
                                    Update Material Pricing
                                </button>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <NumberInput
                                            label="New Purchase Price"
                                            name="bulkPurchasePrice"
                                            value={bulkPurchasePrice}
                                            onChange={(e) => {
                                                setBulkPurchasePrice(
                                                    Number(e.target.value),
                                                );
                                                if (
                                                    formErrors.bulkPurchasePrice
                                                ) {
                                                    setFormErrors((prev) => {
                                                        const newErrors = {
                                                            ...prev,
                                                        };
                                                        delete newErrors.bulkPurchasePrice;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            error={formErrors.bulkPurchasePrice}
                                            min="0"
                                            step="0.01"
                                            unit="$"
                                        />
                                        <NumberInput
                                            label="New Quantity Per Purchase"
                                            name="bulkPurchaseQuantity"
                                            value={bulkPurchaseQuantity}
                                            onChange={(e) => {
                                                setBulkPurchaseQuantity(
                                                    Number(e.target.value),
                                                );
                                                if (
                                                    formErrors.bulkPurchaseQuantity
                                                ) {
                                                    setFormErrors((prev) => {
                                                        const newErrors = {
                                                            ...prev,
                                                        };
                                                        delete newErrors.bulkPurchaseQuantity;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            error={
                                                formErrors.bulkPurchaseQuantity
                                            }
                                            min="0"
                                            step="0.01"
                                            unit={unitAbbreviation}
                                        />
                                    </div>
                                    <DisplayValue
                                        additionalStyle="text-arvo-green-80"
                                        label="New Unit Price"
                                        unit="$"
                                    >
                                        {newCostPerUnit.toFixed(2)}
                                    </DisplayValue>

                                    <div className="flex gap-4 mb-4">
                                        <button
                                            type="button"
                                            onClick={handleSaveNewPricing}
                                            className="text-arvo-blue-100 hover:text-arvo-blue-80 underline cursor-pointer"
                                        >
                                            Save New Pricing
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelUpdatePricing}
                                            className="text-arvo-black-100 hover:text-arvo-black-50 underline cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        // Add Mode
                        <div className="grid grid-cols-2 gap-2">
                            <NumberInput
                                label="Purchase Price*"
                                name="purchasePrice"
                                value={purchasePrice}
                                onChange={(e) =>
                                    setPurchasePrice(Number(e.target.value))
                                }
                                error={formErrors.purchasePrice}
                                min="0"
                                step="0.01"
                                unit="$"
                            />
                            <DisplayValue label="Unit Price" unit="$">
                                {costPerUnit.toFixed(2)}
                            </DisplayValue>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        <TextInput
                            label="Last Purchase Date*"
                            type="date"
                            name="lastPurchaseDate"
                            value={lastPurchaseDate}
                            onChange={(e) =>
                                setLastPurchaseDate(e.target.value)
                            }
                            error={formErrors.lastPurchaseDate}
                        ></TextInput>
                        <NumberInput
                            label="Min. Stock Level"
                            name="minStockLevel"
                            value={minStockLevel}
                            onChange={(e) =>
                                setMinStockLevel(Number(e.target.value))
                            }
                            error={formErrors.minStockLevel}
                            min="0"
                        ></NumberInput>
                        <TextInput
                            label="Supplier"
                            name="supplier"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                            error={formErrors.supplier}
                            placeholder="Supplier Name"
                        ></TextInput>
                        <TextInput
                            label="Supplier URL"
                            name="supplierUrl"
                            type="url"
                            value={supplierUrl}
                            onChange={(e) => setSupplierUrl(e.target.value)}
                            error={formErrors.supplierUrl}
                            placeholder="https://example.com"
                        ></TextInput>
                    </div>
                    <TextArea
                        label="Additional Notes"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></TextArea>
                    <div className="grid grid-cols-2 gap-2">
                        <DisplayValue label="Updated at">
                            {updatedAt}
                        </DisplayValue>
                        <DisplayValue label="Created at">
                            {createdAt}
                        </DisplayValue>
                    </div>
                    <div
                        className={`mt-4 grid ${editingMaterialId && "grid-cols-2 gap-2"}`}
                    >
                        {editingMaterialId && (
                            <Button
                                type="button"
                                value="Delete"
                                onClick={() => handleDelete(editingMaterialId)}
                            ></Button>
                        )}
                        <Button type="submit" value="Save"></Button>
                    </div>
                </form>
            </RightDrawer>
            <ConfirmationModal
                confirmationMessage={`Are you sure you want to delete ${materialToDelete?.name}?`}
                isConfirmationModalOpen={isConfirmationModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                onConfirm={handleConfirmDelete}
            />
            <ConfirmationModal
                confirmationMessage="Changing the material price will update existing expense records, but products using this material will not be updated. Continue?"
                isConfirmationModalOpen={isPriceUpdateModalOpen}
                setIsConfirmationModalOpen={setIsPriceUpdateModalOpen}
                onConfirm={handleConfirmPriceUpdate}
            />
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
        </BaseLayout>
    );
}
