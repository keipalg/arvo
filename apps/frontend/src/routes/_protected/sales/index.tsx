import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import BaseLayout from "../../../components/BaseLayout";
import { trpc, queryClient, type AppRouter } from "../../../utils/trpcClient";
import DataTable from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";

import RightDrawer from "../../../components/drawer/RightDrawer";
import TextInput from "../../../components/input/TextInput";
import Button from "../../../components/button/Button";
import Select from "../../../components/input/Select";
import TextArea from "../../../components/input/TextArea";
import {
    salesInputValidation,
    salesUpdateValidation,
} from "@arvo/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import SalesStatus from "../../../components/badge/SalesStatus";
import PageTitle from "../../../components/layout/PageTitle";
import Metric from "../../../components/metric/Metric";
import SelectCustom from "../../../components/input/SelectCustom";
import NumberInput from "../../../components/input/NumberInput";
import DisplayValue from "../../../components/input/DisplayValue";
import HorizontalRule from "../../../components/hr/HorizontalRule";
export const Route = createFileRoute("/_protected/sales/")({
    component: SalesList,
});

type Sales = inferRouterOutputs<AppRouter>["sales"]["list"][number] & {
    actions: string;
};
type Products = {
    productId: string;
    quantity: number;
    maxQuantity: number;
    retailPrice: number;
};

function SalesList() {
    const [customer, setCustomer] = useState("");
    const [channel, setChannel] = useState("");
    const [channelId, setChannelId] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [products, setProducts] = useState<Products[]>([]);
    const [salesNumber, setSalesNumber] = useState(1);
    const [discount, setDiscount] = useState(0.0);
    const [shippingFee, setShippingFee] = useState(0.0);
    const [tax, setTax] = useState(0.0);
    const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
    const [subTotalPrice, setSubTotalPrice] = useState(0.0);
    const [totalPrice, setTotalPrice] = useState(0.0);

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
            render: (value) => {
                return typeof value === "number" ? (
                    <>#{value.toString().padStart(7, "0")}</>
                ) : (
                    <></>
                );
            },
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
        { key: "channel", header: "Channel" },
        {
            key: "status",
            header: "Status",
            render: (value) => {
                return typeof value === "string" ? (
                    <SalesStatus statusKey={String(value)} />
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
        setCustomer("");
        setChannel(channels?.[0]?.id || "");
        setDate("");
        setStatus(statusList?.[0]?.key || "");
        setNotes("");
        setProducts([]);
        setSalesNumber(nextSalesNumber || 1);
        setDiscount(0.0);
        setShippingFee(0.0);
        setTax(0.0);
        setEditingSaleId(null);
        setFormErrors({});
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };

    const addProductRow = () => {
        setProducts([
            ...products,
            { productId: "", quantity: 0, maxQuantity: 0, retailPrice: 0.0 },
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

            if (
                field === "productId" &&
                typeof value === "string" &&
                productList
            ) {
                const selectedProduct = productList.find(
                    (product) => product.id === value,
                );
                if (selectedProduct) {
                    updatedProducts[index].retailPrice =
                        selectedProduct?.retailPrice || 0.0;
                    updatedProducts[index].maxQuantity =
                        selectedProduct?.inventoryQuantity || 0;

                    if (
                        updatedProducts[index].quantity >
                        updatedProducts[index].maxQuantity
                    ) {
                        updatedProducts[index].quantity =
                            updatedProducts[index].maxQuantity;
                    }
                }
            }
            return updatedProducts;
        });
    };

    const removeProductRow = (index: number) => {
        setProducts((prevProducts) => {
            const updatedProducts = [...prevProducts];
            updatedProducts.splice(index, 1);
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
                await invalidateAllQueries();
            },
        }),
    );

    const editSaleMutation = useMutation(
        trpc.sales.update.mutationOptions({
            onSuccess: async () => {
                await invalidateAllQueries();
            },
        }),
    );

    const deleteSaleMutation = useMutation(
        trpc.sales.delete.mutationOptions({
            onSuccess: async () => {
                await invalidateAllQueries();
            },
        }),
    );

    const invalidateAllQueries = async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: trpc.sales.list.queryKey(),
            }),
            queryClient.invalidateQueries({
                queryKey: trpc.sales.products.queryKey(),
            }),
            queryClient.invalidateQueries({
                queryKey: trpc.sales.nextSalesNumber.queryKey(),
            }),
        ]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSaleId) {
            const result = salesUpdateValidation.safeParse({
                id: editingSaleId,
                customer,
                salesNumber: salesNumber,
                channelId,
                date,
                products,
                statusKey: status,
                totalPrice: totalPrice,
                note: notes,
                discount,
                shippingFee,
                taxPercentage: tax,
            });

            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                console.log(errors);
                console.log(result.error.format().products);
                setFormErrors(errors);
                return;
            }
            setFormErrors({});
            editSaleMutation.mutate(result.data, {
                onSuccess: () => {
                    closeDrawer();
                    setProducts([]);
                },
                onError: (error) => {
                    console.error("Error adding sale:", error);
                },
            });
        } else {
            // Add new sale
            await queryClient.refetchQueries({
                queryKey: trpc.sales.nextSalesNumber.queryKey(),
            });
            const latestNextSalesNumber = queryClient.getQueryData<number>(
                trpc.sales.nextSalesNumber.queryKey(),
            );
            if (latestNextSalesNumber) {
                setSalesNumber(latestNextSalesNumber);
            }

            const result = salesInputValidation.safeParse({
                customer,
                salesNumber: latestNextSalesNumber,
                channelId,
                date,
                products,
                statusKey: status,
                totalPrice: totalPrice,
                note: notes,
                discount,
                shippingFee,
                taxPercentage: tax,
            });

            if (!result.success) {
                const errors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    if (issue.path.length > 0) {
                        errors[issue.path[0] as string] = issue.message;
                    }
                });
                console.log(errors);
                console.log(result.error.format().products);
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            addSaleMutation.mutate(result.data, {
                onSuccess: () => {
                    closeDrawer();
                    setProducts([]);
                },
                onError: (error) => {
                    console.error("Error adding sale:", error);
                },
            });
        }
    };

    const handleEdit = (sale: Sales) => {
        setDrawerOpen(true);
        setCustomer(sale.customer);
        setChannelId(sale.channelId);
        setDate(
            sale.date ? new Date(sale.date).toISOString().slice(0, 16) : "",
        );
        setStatus(sale.status);
        setSalesNumber(sale.salesNumber);
        setEditingSaleId(sale.id);
        setNotes(sale.note || "");
        setDiscount(sale.discount ?? 0.0);
        setShippingFee(sale.shippingFee ?? 0.0);
        setTax(sale.taxPercentage ?? 0.0);

        // Map sale details to products for editing, using latest inventory for maxQuantity
        setProducts(
            (sale.products || []).map((product) => {
                const targetProduct = productList?.find(
                    (p) => p.id === product.goodId,
                );
                const availableInventory =
                    targetProduct?.inventoryQuantity ?? 0;
                return {
                    productId: product.goodId,
                    quantity: product.quantity,
                    maxQuantity: availableInventory + product.quantity,
                    retailPrice: product.pricePerItem,
                };
            }),
        );
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this sale?")) {
            deleteSaleMutation.mutate({ id });
            closeDrawer();
        }
    };

    useEffect(() => {
        if (channels && channels.length > 0 && !channel) {
            setChannelId(channels[0].id);
        }
    }, [channels, channelId]);

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

    useEffect(() => {
        const subtotal = products.reduce(
            (sum, product) => sum + product.retailPrice * product.quantity,
            0,
        );
        setSubTotalPrice(Number(subtotal.toFixed(2)));
        const calculatedTotalPrice =
            (subtotal - discount + shippingFee) * (1 + tax / 100);
        setTotalPrice(Number(calculatedTotalPrice.toFixed(2)));
    }, [products, discount, shippingFee, tax]);

    return (
        <BaseLayout title="Sales List">
            <div className="flex justify-between">
                <PageTitle title="Sales" />
                <Button
                    value="Add New Sales"
                    icon="/icon/plus.svg"
                    onClick={() => setDrawerOpen(true)}
                ></Button>
            </div>
            <div className="flex gap-6 py-2">
                <Metric
                    value={`${String(7)} items`}
                    changePercent={-5}
                    topText="Total Revenue"
                    bottomText="than last month"
                ></Metric>
                <Metric
                    value={`${String(6)} items`}
                    changePercent={15}
                    topText="Total Sales"
                    bottomText="compared to last month"
                ></Metric>
            </div>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
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
                    className="flex flex-col gap-2"
                >
                    <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 justify-between">
                        <TextInput
                            label="Customer"
                            name="customer"
                            placeholder="John Doe"
                            value={customer}
                            required={true}
                            onChange={(e) => setCustomer(e.target.value)}
                            error={formErrors.customer}
                        ></TextInput>
                        <Select
                            label="Channel"
                            name="channelId"
                            value={channelId}
                            options={
                                channels
                                    ? channels.map((ch) => ({
                                          value: ch.id,
                                          label: ch.name,
                                      }))
                                    : []
                            }
                            onChange={(e) => setChannelId(e.target.value)}
                            error={formErrors.channelId}
                        ></Select>
                        <TextInput
                            label="Sale Date & Time"
                            type="datetime-local"
                            name="customer"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            error={formErrors.date}
                        ></TextInput>
                    </div>
                    <Button
                        type="button"
                        value="Add Product"
                        onClick={addProductRow}
                    ></Button>
                    {products.map((row, index) => (
                        <div
                            key={index}
                            className="sm:flex gap-y-2 justify-between items-center"
                        >
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
                            <NumberInput
                                label="Price per item"
                                value={row.retailPrice}
                                step="0.01"
                                min="0"
                                required={true}
                                disabled={true}
                                unit="$"
                                onChange={(e) =>
                                    updateProductRow(
                                        index,
                                        "retailPrice",
                                        e.target.value,
                                    )
                                }
                            ></NumberInput>

                            <NumberInput
                                label="Quantity"
                                value={row.quantity}
                                min="0"
                                max={String(row.maxQuantity)}
                                onChange={(e) =>
                                    updateProductRow(
                                        index,
                                        "quantity",
                                        Number(e.target.value),
                                    )
                                }
                                onBlur={(e) => {
                                    if (
                                        Number(e.target.value) > row.maxQuantity
                                    ) {
                                        updateProductRow(
                                            index,
                                            "quantity",
                                            row.maxQuantity,
                                        );
                                    }
                                }}
                            ></NumberInput>
                            <DisplayValue label="Price" unit="$">
                                {(row.retailPrice * row.quantity).toFixed(2)}
                            </DisplayValue>
                            <button
                                type="button"
                                onClick={() => removeProductRow(index)}
                            >
                                <img
                                    src="/icon/close.svg"
                                    alt="Close"
                                    className="w-4 cursor-pointer"
                                />
                            </button>
                        </div>
                    ))}
                    {formErrors.products && (
                        <div className="text-red-500 text-sm">
                            {formErrors.products}
                        </div>
                    )}
                    <HorizontalRule />
                    <div className="sm:grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <SelectCustom
                                label="Status"
                                name="status"
                                value={status}
                                options={
                                    statusList
                                        ? statusList.map((statusOption) => ({
                                              value: statusOption.key,
                                              label: statusOption.name,
                                              render: (
                                                  <SalesStatus
                                                      statusKey={String(
                                                          statusOption.key,
                                                      )}
                                                  ></SalesStatus>
                                              ),
                                          }))
                                        : []
                                }
                                onChange={setStatus}
                            ></SelectCustom>
                            <TextArea
                                label="Additional Notes"
                                placeholder="Notes"
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></TextArea>
                        </div>
                        <div className="flex flex-col gap-2">
                            <DisplayValue label="Subtotal" unit="$">
                                {subTotalPrice.toFixed(2)}
                            </DisplayValue>
                            <NumberInput
                                label="Discount"
                                name="discount"
                                value={discount}
                                step="0.01"
                                min="0"
                                unit="$"
                                onChange={(e) =>
                                    setDiscount(Number(e.target.value))
                                }
                                error={formErrors.discount}
                            ></NumberInput>
                            <NumberInput
                                label="Shipping Fee"
                                name="shippingFee"
                                value={shippingFee}
                                step="0.01"
                                min="0"
                                unit="$"
                                onChange={(e) =>
                                    setShippingFee(Number(e.target.value))
                                }
                                error={formErrors.shippingFee}
                            ></NumberInput>
                            <NumberInput
                                label="Tax"
                                name="tax"
                                value={tax}
                                step="0.1"
                                min="0"
                                max="100"
                                unit="%"
                                onChange={(e) => setTax(Number(e.target.value))}
                                error={formErrors.tax}
                            ></NumberInput>
                            <DisplayValue label="Total Price" unit="$">
                                {totalPrice.toFixed(2)}
                                <input
                                    type="hidden"
                                    name="totalPrice"
                                    value={Number(totalPrice)}
                                />
                            </DisplayValue>
                        </div>
                    </div>
                    <div
                        className={`grid ${editingSaleId && "grid-cols-2 gap-2"}`}
                    >
                        {editingSaleId && (
                            <Button
                                type="button"
                                value="Delete"
                                onClick={() => handleDelete(editingSaleId)}
                            />
                        )}
                        <Button type="submit" value="Save"></Button>
                    </div>
                </form>
            </RightDrawer>
        </BaseLayout>
    );
}
