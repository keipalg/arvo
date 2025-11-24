import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import BaseLayout from "../../../components/BaseLayout";
import { trpc, queryClient, type AppRouter } from "../../../utils/trpcClient";
import DataTable, {
    type FilterOption,
} from "../../../components/table/DataTable";

import type { inferRouterOutputs } from "@trpc/server";

import RightDrawer from "../../../components/drawer/RightDrawer";
import TextInput from "../../../components/input/TextInput";
import Button from "../../../components/button/Button";
import Select from "../../../components/input/Select";
import TextArea from "../../../components/input/TextArea";
import {
    salesInputValidation,
    salesStatusUpdateValidation,
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
import { MoreButton } from "../../../components/button/MoreButton";
import { MoreButtonProvider } from "../../../components/button/MoreButtonProvider";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import { useIsSmUp } from "../../../utils/screenWidth";
import SaleDetails from "../../../components/table/DataTableDetailSale";
import ToastNotification from "../../../components/modal/ToastNotification";
import ConfirmationModal from "../../../components/modal/ConfirmationModal";
import AddButton from "../../../components/button/AddButton";
import { formatPrice } from "../../../utils/formatPrice";
import DatePicker from "../../../components/input/DatePicker";
import {
    getFormattedDate,
    getDateForInputField,
} from "../../../utils/dateFormatter";
import { useDevAutofill } from "../../../hooks/useDevAutofill.ts";
import { demoData } from "../../../config/demoData.ts";
import MetricsGroup from "../../../components/metric/MetricsGroup.tsx";

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
    cogs: number;
};

function SalesList() {
    const [customer, setCustomer] = useState("");
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
    const [profit, setProfit] = useState(0.0);
    const [cogs, setCogs] = useState(0.0);
    const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
    const [subTotalPrice, setSubTotalPrice] = useState(0.0);
    const [totalPrice, setTotalPrice] = useState(0.0);
    const [viewOnlyMode, setViewOnlyMode] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
        useState(false);
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
    const [selectedItemForDeletion, setSelectedItemForDeletion] = useState("");

    const { data: channels } = useQuery(trpc.channel.list.queryOptions());
    const { data: statusList } = useQuery(trpc.status.list.queryOptions());
    const { data: productList } = useQuery(trpc.sales.products.queryOptions());
    const { data, isLoading, error } = useQuery(trpc.sales.list.queryOptions());
    const { data: nextSalesNumber } = useQuery(
        trpc.sales.nextSalesNumber.queryOptions(),
    );

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data: metricRevenue } = useQuery(
        trpc.sales.metricTotalRevenue.queryOptions({ timezone }),
    );
    const { data: metricSalesCount } = useQuery(
        trpc.sales.metricTotalSalesCount.queryOptions({ timezone }),
    );

    const isSmUp = useIsSmUp();

    const detailsRender = (row: Sales) => {
        const defaultMobileSet = new Set<keyof Sales>();
        if (columns[0]) defaultMobileSet.add(columns[0].key);
        if (columns[1]) defaultMobileSet.add(columns[1].key);
        const actionsCol = columns.find((c) => String(c.key) === "actions");
        if (actionsCol) defaultMobileSet.add(actionsCol.key);

        const mobileSet = new Set<keyof Sales>(Array.from(defaultMobileSet));

        const visibleMobileColumnsCount = columns.filter((c) =>
            mobileSet.has(c.key),
        ).length;

        return (
            <SaleDetails
                row={row}
                columnsLength={columns.length}
                visibleMobileColumnsCount={visibleMobileColumnsCount}
                isSmUp={isSmUp}
            />
        );
    };

    const columns: Array<{
        key: keyof Sales;
        header: string;
        render?: (value: Sales[keyof Sales], row: Sales) => React.ReactNode;
    }> = [
        {
            key: "salesNumber",
            header: "Sales Number",
            render: (_value, row) => {
                return typeof row.salesNumber === "number" ? (
                    <button
                        type="button"
                        className="text-arvo-blue-100 font-semibold cursor-pointer"
                        onClick={() => handleView(row)}
                        aria-label={`View sale #${String(row.salesNumber).padStart(7, "0")}`}
                    >
                        #{String(row.salesNumber).padStart(7, "0")}
                    </button>
                ) : (
                    <></>
                );
            },
        },
        { key: "customer", header: "Customer" },
        {
            key: "totalPrice",
            header: "Total Price",
            render: (value) => (
                <div className="text-arvo-green-100">
                    {formatPrice(Number(value))}
                </div>
            ),
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
                        <>{getFormattedDate(dateObj)}</>
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
                    <MoreButton
                        id={row.id}
                        onEdit={() => handleEdit(row)}
                        onDeleteModal={() => handleDeleteModal(row.id)}
                    />
                </>
            ),
        },
    ];

    const resetForm = () => {
        setCustomer("");
        setDate("");
        setStatus(statusList?.[0]?.key || "");
        setNotes("");
        setProducts([]);
        setSalesNumber(nextSalesNumber || 1);
        setDiscount(0.0);
        setShippingFee(0.0);
        setTax(0.0);
        setProfit(0.0);
        setCogs(0.0);
        setEditingSaleId(null);
        setFormErrors({});
        setViewOnlyMode(false);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        resetForm();
    };

    const addProductRow = () => {
        setProducts([
            ...products,
            {
                productId: "",
                quantity: 0,
                maxQuantity: 0,
                retailPrice: 0.0,
                cogs: 0.0,
            },
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
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Added sales successfully!",
                });
                setVisibleToast(true);
            },
            onError: () => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error adding sales`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const editSaleMutation = useMutation(
        trpc.sales.update.mutationOptions({
            onSuccess: async () => {
                await invalidateAllQueries();
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Updated sales successfully!",
                });
                setVisibleToast(true);
            },
            onError: () => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error updating sales`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const updateSaleStatusMutation = useMutation(
        trpc.sales.updateStatus.mutationOptions({
            onSuccess: async () => {
                await invalidateAllQueries();
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Updated sales status successfully!",
                });
                setVisibleToast(true);
            },
            onError: () => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error updating sales status`,
                });
                setVisibleToast(true);
            },
        }),
    );

    const deleteSaleMutation = useMutation(
        trpc.sales.delete.mutationOptions({
            onSuccess: async () => {
                await invalidateAllQueries();
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Deleted sales successfully!",
                });
                setVisibleToast(true);
            },
            onError: () => {
                setToastMessage({
                    kind: "WARN",
                    content: `Error deleting sales`,
                });
                setVisibleToast(true);
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
            queryClient.invalidateQueries({
                queryKey: trpc.sales.metricTotalRevenue.queryKey(),
            }),
            queryClient.invalidateQueries({
                queryKey: trpc.sales.metricTotalSalesCount.queryKey(),
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

    const handleStatusSubmit = (newStatus: string) => {
        if (editingSaleId) {
            const result = salesStatusUpdateValidation.safeParse({
                id: editingSaleId,
                statusKey: newStatus,
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
            updateSaleStatusMutation.mutate(result.data, {
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
        setViewOnlyMode(false);
        setDrawerOpen(true);
        setCustomer(sale.customer);
        setChannelId(sale.channelId);
        setDate(sale.date ? getFormattedDate(new Date(sale.date)) : "");
        setStatus(sale.status);
        setSalesNumber(sale.salesNumber);
        setEditingSaleId(sale.id);
        setNotes(sale.note || "");
        setDiscount(sale.discount ? Number(sale.discount) : 0.0);
        setShippingFee(sale.shippingFee ? Number(sale.shippingFee) : 0.0);
        setTax(sale.taxPercentage ?? 0.0);
        setProfit(sale.profit ?? 0.0);
        setCogs(sale.cogs ?? 0.0);

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
                    cogs: product.cogs,
                };
            }),
        );
    };

    const handleView = (sale: Sales) => {
        handleEdit(sale);
        setViewOnlyMode(true);
    };

    const handleDeleteModal = (saleId: string) => {
        setSelectedItemForDeletion(saleId);
        setIsConfirmationModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteSaleMutation.mutate({ id });
    };

    useEffect(() => {
        if (channels && channels.length > 0 && !channelId) {
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

    // ===========================================================
    // START: Code for Dev Autofill
    // ===========================================================
    useDevAutofill(() => {
        // Execute only when drawer is open and not editing
        if (!drawerOpen || editingSaleId || viewOnlyMode) return;

        const config = demoData.sales;

        // Autofill basic fields only if provided
        if (config.customer !== undefined) setCustomer(config.customer);
        if (config.notes !== undefined) setNotes(config.notes);
        if (config.discount !== undefined) setDiscount(config.discount);
        if (config.shipping !== undefined) setShippingFee(config.shipping);
        if (config.tax !== undefined) setTax(config.tax);

        // Set sales date today
        if (config.salesDate !== undefined) {
            if (config.salesDate.toLowerCase() === "today") {
                setDate(getDateForInputField(new Date()));
            } else {
                setDate(config.salesDate);
            }
        }

        // Find and set channel by name
        if (config.channel && channels) {
            const matchingChannel = channels.find((c) =>
                c.name.toLowerCase().includes(config.channel!.toLowerCase()),
            );
            if (matchingChannel) {
                setChannelId(matchingChannel.id);
            }
        }

        // Find and set status by name
        if (config.status && statusList) {
            const matchingStatus = statusList.find((s) =>
                s.name.toLowerCase().includes(config.status!.toLowerCase()),
            );
            if (matchingStatus) {
                setStatus(matchingStatus.key);
            }
        }

        // Autofill products only if provided
        if (config.products && config.products.length > 0 && productList) {
            const demoProducts: Products[] = [];

            for (const configProduct of config.products) {
                // Find matching product from the list
                const matchingProduct = productList.find((prod) =>
                    prod.name
                        .toLowerCase()
                        .includes(configProduct.name.toLowerCase()),
                );

                if (matchingProduct) {
                    demoProducts.push({
                        productId: matchingProduct.id,
                        quantity: configProduct.quantity,
                        maxQuantity: matchingProduct.inventoryQuantity || 0,
                        retailPrice: matchingProduct.retailPrice || 0,
                        cogs: 0,
                    });
                }
            }

            // Update products state only if matches found
            if (demoProducts.length > 0) {
                setProducts(demoProducts);
            }
        }
    }, [
        drawerOpen,
        editingSaleId,
        viewOnlyMode,
        channels,
        statusList,
        productList,
    ]);
    // ===========================================================
    // END: Code for Dev Autofill
    // ===========================================================

    const tableFilterOptions: FilterOption<Sales>[] = [
        {
            key: "status",
            label: "Status",
            values:
                statusList?.map((s) => ({
                    key: String(s.key),
                    label: String(s.name),
                })) ?? [],
        },
        {
            key: "channel",
            label: "Channel",
            values:
                channels?.map((c) => ({
                    key: String(c.name),
                    label: String(c.name),
                })) ?? [],
        },
    ];

    return (
        <BaseLayout title="Sales List">
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
            <ConfirmationModal
                confirmationMessage="Are you sure you want to delete this sale?"
                isConfirmationModalOpen={isConfirmationModalOpen}
                setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                onConfirm={() => {
                    handleDelete(selectedItemForDeletion);
                }}
            />
            <div className="flex justify-between">
                <PageTitle
                    title="Sales"
                    info="Sales automatically records and tracks all your product sales in one place."
                />
                <AddButton
                    value="Add New Sales"
                    onClick={() => setDrawerOpen(true)}
                    icon="/icon/plus.svg"
                ></AddButton>
            </div>
            <MetricsGroup noMetricsAvailable={!data || data.length === 0}>
                <Metric
                    value={
                        metricRevenue
                            ? `$${Number(metricRevenue.totalRevenue).toFixed(2)}`
                            : "-"
                    }
                    changePercent={metricRevenue?.change ?? 0}
                    topText="Total Monthly Revenue"
                    bottomText="compared to last month"
                    showPercentage={metricRevenue?.change != null}
                />
                <Metric
                    value={
                        metricSalesCount
                            ? `${String(metricSalesCount.totalSalesCount)} items`
                            : "-"
                    }
                    changePercent={metricSalesCount?.change ?? 0}
                    topText="Total Monthly Sales"
                    bottomText="compared to last month"
                    showPercentage={metricSalesCount?.change != null}
                />
            </MetricsGroup>
            {isLoading && <LoadingSpinner />}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <MoreButtonProvider>
                    <DataTable
                        columns={columns}
                        data={tabledData || []}
                        detailRender={detailsRender}
                        detailVisibility="mobile"
                        mobileVisibleKeys={[
                            "salesNumber",
                            "totalPrice",
                            "actions",
                        ]}
                        sortOptions={[
                            {
                                key: "salesNumber",
                                label: "Sales Number (Newest → Oldest)",
                                order: "desc",
                            },
                            {
                                key: "salesNumber",
                                label: "Sales Number (Oldest → Newest)",
                                order: "asc",
                            },
                            {
                                key: "date",
                                label: "Date (Newest → Oldest)",
                                order: "desc",
                            },
                            {
                                key: "date",
                                label: "Date (Oldest → Newest)",
                                order: "asc",
                            },
                        ]}
                        filterOptions={tableFilterOptions}
                        searchOption={{
                            key: "customer",
                            label: "Customer",
                        }}
                    />
                </MoreButtonProvider>
            )}
            <RightDrawer
                title={"#" + String(salesNumber).padStart(7, "0")}
                isOpen={drawerOpen}
                onClose={() => closeDrawer()}
                narrower={viewOnlyMode}
            >
                {viewOnlyMode ? (
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="grid grid-cols-1 gap-2">
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
                                onChange={handleStatusSubmit}
                            ></SelectCustom>
                        </div>
                        <div className="pt-2">
                            <div className="mt-2 space-y-2">
                                <div className="grid grid-cols-[1fr_100px_100px] gap-2">
                                    <div className="font-semibold text-xl">
                                        Item
                                    </div>
                                    <div className="font-semibold text-xl">
                                        Qty
                                    </div>
                                    <div className="font-semibold text-xl text-right">
                                        Amount
                                    </div>
                                    {products.map((p) => {
                                        const productName =
                                            productList?.find(
                                                (x) => x.id === p.productId,
                                            )?.name ?? p.productId;
                                        return (
                                            <React.Fragment key={p.productId}>
                                                <div className="font-semibold">
                                                    {productName}
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">
                                                        {p.quantity}
                                                    </span>
                                                    <span>
                                                        @{" "}
                                                        {formatPrice(
                                                            p.retailPrice,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="font-semibold text-right">
                                                    {formatPrice(
                                                        p.retailPrice *
                                                            p.quantity,
                                                    )}
                                                </div>
                                                <div className="col-span-3 text-right">
                                                    {formatPrice(p.cogs)} COGS
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <HorizontalRule />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-semibold">Subtotal</div>
                            <div className="font-semibold text-right">
                                {formatPrice(subTotalPrice)}
                            </div>

                            <div className="font-semibold">Discount</div>
                            <div className="font-semibold text-right">
                                {discount ? `${formatPrice(discount)}` : "-"}
                            </div>

                            <div className="font-semibold">Shipping Fee</div>
                            <div className="font-semibold text-right">
                                {shippingFee
                                    ? `${formatPrice(shippingFee)}`
                                    : "-"}
                            </div>

                            <div className="font-semibold">Tax</div>
                            <div className="font-semibold text-right">
                                {tax ? tax.toFixed(2) + "%" : "-"}
                            </div>
                        </div>
                        <HorizontalRule />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-semibold">Total</div>
                            <div className="font-semibold text-right">
                                {formatPrice(totalPrice)}
                            </div>
                        </div>
                        <HorizontalRule />
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="font-semibold">
                                Cost of Goods Sold (COGS)
                            </div>
                            <div className="font-semibold text-right">
                                {formatPrice(cogs)}
                            </div>
                            <div className="font-semibold">Gross Profit</div>
                            <div className="font-semibold text-right">
                                {formatPrice(profit)}
                            </div>
                            <div className="font-semibold">Profit Margin</div>
                            <div className="font-semibold text-right">
                                {((profit / totalPrice) * 100).toFixed(2)}%
                            </div>
                        </div>
                        <div className="font-semibold">Sales Date</div>
                        <div>
                            {date ? getFormattedDate(new Date(date)) : "-"}
                        </div>
                        <div>
                            <div className="font-semibold">
                                Note : {notes || "-"}
                            </div>
                        </div>
                    </div>
                ) : (
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
                                style="top-3/5"
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
                            <DatePicker
                                label="Sales Date"
                                name="date"
                                value={date}
                                onChange={setDate}
                                error={formErrors.date}
                            ></DatePicker>
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
                                            Number(e.target.value) >
                                            row.maxQuantity
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
                                    {(row.retailPrice * row.quantity).toFixed(
                                        2,
                                    )}
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
                                            ? statusList.map(
                                                  (statusOption) => ({
                                                      value: statusOption.key,
                                                      label: statusOption.name,
                                                      render: (
                                                          <SalesStatus
                                                              statusKey={String(
                                                                  statusOption.key,
                                                              )}
                                                          ></SalesStatus>
                                                      ),
                                                  }),
                                              )
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
                                    onChange={(e) =>
                                        setTax(Number(e.target.value))
                                    }
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
                                    onClick={() =>
                                        handleDeleteModal(editingSaleId)
                                    }
                                />
                            )}
                            <Button type="submit" value="Save"></Button>
                        </div>
                    </form>
                )}
            </RightDrawer>
        </BaseLayout>
    );
}
