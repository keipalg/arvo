import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import { queryClient, trpc } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../../../components/button/Button";
import { useEffect, useState } from "react";
import RightDrawer from "../../../components/drawer/RightDrawer";
import TextInput from "../../../components/input/TextInput";
import NumberInput from "../../../components/input/NumberInput";
import TextArea from "../../../components/input/TextArea";
import Select from "../../../components/input/Select";
import { addMaterialsValidation } from "shared/validation/materialsValidation";

export const Route = createFileRoute("/_protected/materials/")({
    component: MaterialsList,
});

type Materials = inferRouterOutputs<AppRouter>["materials"]["list"][number] & {
    actions: string;
};

function MaterialsList() {
    const [itemName, setItemName] = useState("");
    const [type, setType] = useState("");
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
        { key: "type", header: "Type" },
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
                            className="text-blue-400 hover:underline"
                            onClick={() => handleEdit(row)}
                        >
                            Edit
                        </button>
                    </div>
                </>
            ),
        },
    ];

    const resetForm = () => {
        setItemName("");
        setType("");
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
        setType(material.type);
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

        const result = addMaterialsValidation.safeParse({
            name: itemName,
            type,
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
            <h3 className="">Materials</h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <Button value="Add" onClick={() => setDrawerOpen(true)}></Button>
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
            <RightDrawer isOpen={drawerOpen} onClose={() => closeDrawer()}>
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
                    {/* To be update to dynamic text input type where user can select existing types */}
                    <TextInput
                        label="Material Type"
                        name="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        error={formErrors.type}
                    ></TextInput>
                    <NumberInput
                        label="Quantity"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        error={formErrors.quantity}
                        min="0"
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
                        name="type"
                        value={costPerUnit}
                        onChange={(e) => setCostPerUnit(Number(e.target.value))}
                        error={formErrors.cost}
                        min="0"
                        step="0.01"
                    ></NumberInput>
                    <TextInput
                        label="Last Purchase Date"
                        type="date"
                        name="lastPurchaseDate"
                        value={lastPurchaseDate}
                        onChange={(e) => setLastPurchaseDate(e.target.value)}
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
                    <Button type="submit" value="Save"></Button>
                    {editingMaterialId && (
                        <Button
                            type="button"
                            value="Delete"
                            onClick={() => handleDelete(editingMaterialId)}
                        ></Button>
                    )}
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
