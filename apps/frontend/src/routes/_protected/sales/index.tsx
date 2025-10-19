import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import BaseLayout from "../../../components/BaseLayout";
import { trpc, queryClient } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "shared/trpc";

import RightDrawer from "../../../components/drawer/RightDrawer";
import TextInput from "../../../components/input/TextInput";
import Button from "../../../components/button/Button";
import Select from "../../../components/input/Select";
import TextArea from "../../../components/input/TextArea";
import { salesInputValidation } from "shared/validation/salesValidation";
import { useMutation, useQuery } from "@tanstack/react-query";
export const Route = createFileRoute("/_protected/sales/")({
    component: SalesList,
});

type Sales = inferRouterOutputs<AppRouter>["sales"]["list"][number] & {
    actions: string;
};
type Products = {
    productId: string;
    quantity: number;
    retailPrice: string;
};

function SalesList() {
    const [customer, setCustomer] = useState("");
    const [channel, setChannel] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [products, setProducts] = useState<Products[]>([]);
    const [salesNumber, setSalesNumber] = useState(1);
    const [discount, setDiscount] = useState("0.00");
    const [tax, setTax] = useState("0.00");

    const { data: channels } = useQuery(trpc.channel.list.queryOptions());
    const { data: statusList } = useQuery(trpc.status.list.queryOptions());
    const { data: productList } = useQuery(trpc.sales.products.queryOptions());
    const { data, isLoading, error } = useQuery(trpc.sales.list.queryOptions());
    const { data: nextSalesNumber } = useQuery(
        trpc.sales.nextSalesNumber.queryOptions(),
    );
    const columns: Array<{
        key: keyof Sales;
        header: string;
        render?: (value: Sales[keyof Sales], row: Sales) => React.ReactNode;
    }> = [
        {
            key: "salesNumber",
            header: "Sales Number",
            render: (value) => <>#{String(value).padStart(7, "0")}</>,
        },
        { key: "customer", header: "Customer" },
        {
            key: "totalPrice",
            header: "Total Price",
            render: (value) => <>${Number(value).toFixed(2)}</>,
        },
        {
            key: "date",
            header: "Date",
            render: (value) => <>{new Date(value).toLocaleDateString()}</>,
        },
        { key: "channel", header: "Channel" },
        { key: "status", header: "Status" },
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
        setCustomer("");
        setChannel(channels?.[0]?.id || "");
        setDate("");
        setStatus(statusList?.[0]?.key || "");
        setNotes("");
        setProducts([]);
        setSalesNumber(nextSalesNumber || 1);
        setDiscount("0.00");
        setTax("0.00");
        setFormErrors({});
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };

    const addProductRow = () => {
        setProducts([
            ...products,
            { productId: "", quantity: 1, retailPrice: "0.00" },
        ]);
    };

    const updateProductRow = (
        index: number,
        field: keyof Products,
        value: string | number,
    ) => {
        setProducts((prevProducts) => {
            const updatedProducts = [...prevProducts];
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value,
            };
            return updatedProducts;
        });
    };

    const tabledData = data?.map((element) => ({
        ...element,
        actions: "",
    }));

    const addSaleMutation = useMutation(
        trpc.sales.add.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.sales.list.queryKey(),
                });
            },
        }),
    );

    const deleteSaleMutation = useMutation(
        trpc.sales.delete.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.sales.list.queryKey(),
                });
            },
        }),
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await queryClient.refetchQueries({
            queryKey: trpc.sales.nextSalesNumber.queryKey(),
        });
        const latestNextSalesNumber = queryClient.getQueryData<number>(
            trpc.sales.nextSalesNumber.queryKey(),
        );
        if (latestNextSalesNumber) {
            setSalesNumber(latestNextSalesNumber);
        }

        let calculatedTotalPrice = 0;
        products.forEach((product) => {
            const price = parseFloat(product.retailPrice);
            calculatedTotalPrice += price * product.quantity;
        });

        const result = salesInputValidation.safeParse({
            customer,
            salesNumber: latestNextSalesNumber ?? salesNumber,
            channelId: channel,
            date,
            products,
            statusKey: status,
            totalPrice: calculatedTotalPrice.toFixed(2),
            note: notes,
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
        addSaleMutation.mutate(result.data);
        setDrawerOpen(false);
        setProducts([]);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this sale?")) {
            deleteSaleMutation.mutate({ id });
        }
    };

    useEffect(() => {
        if (channels && channels.length > 0 && !channel) {
            setChannel(channels[0].id);
        }
    }, [channels, channel]);

    useEffect(() => {
        if (statusList && statusList.length > 0 && !status) {
            setStatus(statusList[0].key);
        }
    }, [statusList, status]);

    useEffect(() => {
        if (nextSalesNumber) {
            setSalesNumber(nextSalesNumber);
        }
    }, [nextSalesNumber]);

    return (
        <BaseLayout title="Sales List">
            <h3 className="">Sales</h3>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <Button value="Add" onClick={() => setDrawerOpen(true)}></Button>
            {!isLoading && !error && (
                <DataTable columns={columns} data={tabledData || []} />
            )}
            <RightDrawer isOpen={drawerOpen} onClose={() => closeDrawer()}>
                <h3 className="text-2xl">
                    #{String(salesNumber).padStart(7, "0")}
                </h3>
                <form
                    onSubmit={(e) => {
                        void handleSubmit(e);
                    }}
                >
                    <TextInput
                        label="Customer"
                        name="customer"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        error={formErrors.customer}
                    ></TextInput>
                    <Select
                        label="Channel"
                        name="channel"
                        value={channel}
                        options={
                            channels
                                ? channels.map((ch) => ({
                                      value: ch.id,
                                      label: ch.name,
                                  }))
                                : []
                        }
                        onChange={(e) => setChannel(e.target.value)}
                    ></Select>
                    <TextInput
                        label="Sale Date & Time"
                        type="datetime-local"
                        name="customer"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    ></TextInput>
                    <Button
                        type="button"
                        value="Add Product"
                        onClick={addProductRow}
                    ></Button>
                    {products.map((row, index) => (
                        <div key={index}>
                            <Select
                                label="Product"
                                value={row.productId}
                                options={[
                                    { value: "", label: "" },
                                    ...(productList
                                        ? productList.map((product) => ({
                                              value: product.id,
                                              label: product.name,
                                          }))
                                        : []),
                                ]}
                                onChange={(e) =>
                                    updateProductRow(
                                        index,
                                        "productId",
                                        e.target.value,
                                    )
                                }
                            ></Select>

                            <TextInput
                                label="Quantity"
                                type="number"
                                value={String(row.quantity)}
                                onChange={(e) =>
                                    updateProductRow(
                                        index,
                                        "quantity",
                                        Number(e.target.value),
                                    )
                                }
                            ></TextInput>

                            <TextInput
                                label="Price"
                                type="number"
                                value={row.retailPrice}
                                step="0.01"
                                onChange={(e) =>
                                    updateProductRow(
                                        index,
                                        "retailPrice",
                                        e.target.value,
                                    )
                                }
                            ></TextInput>
                        </div>
                    ))}
                    <Select
                        label="Status"
                        name="status"
                        value={status}
                        options={
                            statusList
                                ? statusList.map((statusOption) => ({
                                      value: statusOption.key,
                                      label: statusOption.name,
                                  }))
                                : []
                        }
                        onChange={(e) => setStatus(e.target.value)}
                    ></Select>
                    <TextArea
                        label="Additional Notes"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></TextArea>
                    <TextInput
                        label="Discount"
                        type="number"
                        name="discount"
                        value={discount}
                        step="0.01"
                        onChange={(e) => setDiscount(e.target.value)}
                    ></TextInput>
                    <TextInput
                        label="Tax"
                        type="number"
                        name="tax"
                        value={tax}
                        step="0.01"
                        onChange={(e) => setTax(e.target.value)}
                    ></TextInput>
                    <Button type="submit" value="Add Sale"></Button>
                    <Button
                        value="Cancel"
                        onClick={() => setDrawerOpen(false)}
                    ></Button>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
