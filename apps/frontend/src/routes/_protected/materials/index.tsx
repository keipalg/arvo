import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { queryClient, trpc, type AppRouter } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../../../components/button/Button";
import { useEffect, useState } from "react";
import RightDrawer from "../../../components/drawer/RightDrawer";
import TextInput from "../../../components/input/TextInput";
import NumberInput from "../../../components/input/NumberInput";
import TextArea from "../../../components/input/TextArea";
import Select from "../../../components/input/Select";
import {
    addMaterialsValidation,
    updateMaterialsValidation,
} from "@arvo/shared";
import PageTitle from "../../../components/layout/PageTitle";
import Metric from "../../../components/metric/Metric";

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
    const [typeId, setTypeId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [minStockLevel, setMinStockLevel] = useState(0);
    const [costPerUnit, setCostPerUnit] = useState(0);
    const [unit, setUnit] = useState("");
    const [lastPurchaseDate, setLastPurchaseDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [notes, setNotes] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
        null,
    );

    const { data: unitsList } = useQuery(trpc.units.list.queryOptions());
    const { data: materialTypesList } = useQuery(
        trpc.materialTypes.list.queryOptions(),
    );
    const { data, isLoading, error } = useQuery(
        trpc.materials.list.queryOptions(),
    );
    const columns: Array<{
        key: keyof Materials;
        header: string;
        render?: (
            value: Materials[keyof Materials],
            row: Materials,
        ) => React.ReactNode;
    }> = [
        { key: "materialType", header: "Type" },
        { key: "name", header: "Item" },
        { key: "formattedQuantity", header: "Quantity" },
        {
            key: "costPerUnit",
            header: "Unit Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "lastPurchaseDate",
            header: "Last Purchase Date",
            render: (value) => (
                <>{new Date(value as Date).toLocaleDateString()}</>
            ),
        },
        { key: "status", header: "Status" },
        {
            key: "actions",
            header: "Action",
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
        setItemName("");
        setTypeId("");
        setQuantity(0);
        setMinStockLevel(0);
        setCostPerUnit(0);
        setUnit("");
        setLastPurchaseDate("");
        setSupplier("");
        setNotes("");
        setFormErrors({});
        setEditingMaterialId(null);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };

    const handleEdit = (material: Materials) => {
        setEditingMaterialId(material.id);
        setItemName(material.name);
        setTypeId(material.materialTypeId);
        setQuantity(material.quantity);
        setMinStockLevel(material.threshold || 0);
        setCostPerUnit(Number(material.costPerUnit) || 0);
        setUnit(material.unitName);
        setLastPurchaseDate(
            material.lastPurchaseDate
                ? new Date(material.lastPurchaseDate)
                      .toISOString()
                      .split("T")[0]
                : "",
        );
        setSupplier(material.supplier || "");
        setNotes(material.notes || "");
        setDrawerOpen(true);
    };

    const tabledData = data?.map((element) => ({
        ...element,
        actions: "",
    }));

    const addMaterialMutation = useMutation(
        trpc.materials.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.list.queryKey(),
                });
            },
        }),
    );

    const updateMaterialMutation = useMutation(
        trpc.materials.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.list.queryKey(),
                });
            },
        }),
    );

    const deleteMaterialMutation = useMutation(
        trpc.materials.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.materials.list.queryKey(),
                });
            },
        }),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMaterialId) {
            // Update existing material
            const result = updateMaterialsValidation.safeParse({
                id: editingMaterialId,
                name: itemName,
                typeId,
                unit,
                quantity,
                costPerUnit,
                minStockLevel,
                lastPurchaseDate,
                supplierName: supplier,
                notes,
            });

            setFormErrors({});
            updateMaterialMutation.mutate(result.data);
            closeDrawer();
        } else {
            // Add new material
            const result = addMaterialsValidation.safeParse({
                name: itemName,
                typeId,
                unit,
                quantity,
                costPerUnit,
                minStockLevel,
                lastPurchaseDate,
                supplierName: supplier,
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
        if (window.confirm("Are you sure you want to delete this material?")) {
            deleteMaterialMutation.mutate({ id });
            closeDrawer();
        }
    };

    useEffect(() => {
        if (unitsList && unitsList.length > 0 && !unit) {
            setUnit(unitsList[0].name);
        }
    }, [unitsList, unit]);

    return (
        <BaseLayout title="Materials List">
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <div className="flex justify-between">
                <PageTitle title="My Materials" info={tooltip} />
                <Button
                    value="Add New Material"
                    onClick={() => setDrawerOpen(true)}
                    icon="/icon/plus.svg"
                ></Button>
            </div>
            <div className="flex gap-6 py-2">
                <Metric
                    value={`$ 348`}
                    changePercent={-5}
                    topText="Total Inventory Cost (to be implemented)"
                    bottomText="compared to last month"
                ></Metric>
            </div>
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
            <RightDrawer isOpen={drawerOpen} onClose={() => closeDrawer()}>
                <h2 className="text-xl font-bold mb-4">
                    {editingMaterialId ? "Edit Material" : "Add Material"}
                </h2>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <TextInput
                        label="Material Item"
                        name="name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        error={formErrors.name}
                    ></TextInput>
                    {/* TODO be update to dynamic text input type where user can select existing types */}
                    <Select
                        label="Material Type"
                        name="typeId"
                        value={typeId}
                        options={
                            materialTypesList
                                ? [
                                      { value: "", label: "Select a type..." },
                                      ...materialTypesList.map(
                                          (typeOption) => ({
                                              value: typeOption.id,
                                              label: typeOption.name,
                                          }),
                                      ),
                                  ]
                                : [{ value: "", label: "Select a type..." }]
                        }
                        onChange={(e) => setTypeId(e.target.value)}
                        error={formErrors.typeId}
                    ></Select>
                    <NumberInput
                        label="Quantity"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        error={formErrors.quantity}
                        min="0"
                        // disabled={!!editingMaterialId} // TODO - to disable later for add quantity implementation
                    ></NumberInput>
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
                    <NumberInput
                        label="Unit Price"
                        name="costPerUnit"
                        value={costPerUnit}
                        onChange={(e) => setCostPerUnit(Number(e.target.value))}
                        error={formErrors.costPerUnit}
                        min="0"
                        step="0.01"
                    ></NumberInput>
                    <TextInput
                        label="Last Purchase Date"
                        type="date"
                        name="lastPurchaseDate"
                        value={lastPurchaseDate}
                        onChange={(e) => setLastPurchaseDate(e.target.value)}
                        error={formErrors.lastPurchaseDate}
                    ></TextInput>
                    <TextInput
                        label="Supplier"
                        name="supplier"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        error={formErrors.supplier}
                    ></TextInput>
                    <TextArea
                        label="Additional Notes"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></TextArea>
                    <Select
                        label="Unit"
                        name="unit"
                        value={unit}
                        options={
                            unitsList
                                ? unitsList.map((unitsOption) => ({
                                      value: unitsOption.name,
                                      label: `${unitsOption.name} (${unitsOption.abv})`,
                                  }))
                                : []
                        }
                        onChange={(e) => setUnit(e.target.value)}
                    ></Select>
                    <div className="flex gap-2">
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
        </BaseLayout>
    );
}
