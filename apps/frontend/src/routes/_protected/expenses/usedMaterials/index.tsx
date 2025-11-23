import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../../components/BaseLayout";
import { trpc, type AppRouter } from "../../../../utils/trpcClient";
import { useQuery } from "@tanstack/react-query";
import DataTable, {
    type FilterOption,
} from "../../../../components/table/DataTable";
import type { inferRouterOutputs } from "@trpc/server";
import PageTitle from "../../../../components/layout/PageTitle";
import Metric from "../../../../components/metric/Metric";
import { useEffect, useMemo, useState } from "react";
import { useIsSmUp } from "../../../../utils/screenWidth";
import MaterialExpenseDetails from "../../../../components/table/DataTableDetailMaterialExpense";
import {
    getDateForInputField,
    getGroupedDatesByMonth,
} from "../../../../utils/dateFormatter";

export const Route = createFileRoute("/_protected/expenses/usedMaterials/")({
    component: UsedMaterials,
});

export type UsedMaterialPerSales =
    inferRouterOutputs<AppRouter>["sales"]["usedMaterialPerSales"][number] & {
        actions: string;
    };

export type UsedMaterialPerSalesRow = {
    id: number;
    salesId: string;
    soldDate: string;
    salesNumber: number;
    goodID: string;
    goodName: string;
    quantity: number;
    materialOutputRatioId: string;
    materialOutputRatio: number;
    materialID: string;
    materialName: string;
    costPerUnit: number;
    unit: string;
    usedMaterialCost: number;
    actions: string;
};

function UsedMaterials() {
    const [totalExpensesThisMonth, setTotalExpensesThisMonth] = useState<
        Record<string, number | string> | undefined
    >(undefined);

    const { data: usedMaterialPerSales } = useQuery(
        trpc.sales.usedMaterialPerSales.queryOptions(),
    );
    console.log("usedMaterialPerSales:", usedMaterialPerSales);

    const tableFilterOptions: FilterOption<UsedMaterialPerSalesRow>[] =
        useMemo(() => {
            if (!usedMaterialPerSales?.length) return [];

            const dates = usedMaterialPerSales.map((usedMaterialPerSale) =>
                getDateForInputField(usedMaterialPerSale.soldDate),
            );
            const grouped = getGroupedDatesByMonth(dates);

            const years = Object.keys(grouped).sort(
                (a, b) => Number(b) - Number(a),
            );
            console.log("grouped dates by month:", grouped);

            return years
                .map((year) => {
                    const months = grouped[year];
                    if (!months) return null;

                    // Get month keys sorted chronologically (newest first)
                    const monthKeys = Object.keys(months).sort(
                        (a, b) => Number(b) - Number(a),
                    );

                    const monthValues = monthKeys
                        .map((monthKey) => {
                            const monthData = months[monthKey];
                            if (!monthData) return null;

                            // Use YYYY-MM format as the key for partial matching
                            const yearMonth = `${year}-${monthKey}`;

                            return {
                                key: yearMonth,
                                label: `${monthData.monthName} (${monthData.count})`,
                            };
                        })
                        .filter(Boolean) as Array<{
                        key: string;
                        label: string;
                    }>;

                    return {
                        key: `soldDate:${year}`,
                        label: year,
                        values: monthValues,
                    };
                })
                .filter(Boolean) as FilterOption<UsedMaterialPerSalesRow>[];
        }, [usedMaterialPerSales]);
    console.log("tableFilterOptions:", tableFilterOptions);

    const isSmUp = useIsSmUp();
    const detailsRender = (row: UsedMaterialPerSalesRow) => {
        const defaultMobileSet = new Set<keyof UsedMaterialPerSalesRow>();
        if (columns[0]) defaultMobileSet.add(columns[0].key);
        if (columns[1]) defaultMobileSet.add(columns[1].key);
        if (columns[2]) defaultMobileSet.add(columns[2].key);
        const actionsCol = columns.find((c) => String(c.key) === "actions");
        if (actionsCol) defaultMobileSet.add(actionsCol.key);

        const mobileSet = new Set<keyof UsedMaterialPerSalesRow>(
            Array.from(defaultMobileSet),
        );

        const visibleMobileColumnsCount = columns.filter((c) =>
            mobileSet.has(c.key),
        ).length;

        return (
            <MaterialExpenseDetails
                row={row}
                columnsLength={columns.length}
                visibleMobileColumnsCount={visibleMobileColumnsCount}
                isSmUp={isSmUp}
            />
        );
    };

    useEffect(() => {
        /*****
         * Calculate total used material cost per material for current and previous month
         */
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonth = previousMonthDate.getMonth();
        const previousYear = previousMonthDate.getFullYear();

        const calcTotalByMaterialByMonth = (year: number, month: number) =>
            usedMaterialPerSales?.reduce(
                (accumulator, currentValue) => {
                    const soldMonth = new Date(
                        currentValue.soldDate,
                    ).getMonth();
                    const soldYear = new Date(
                        currentValue.soldDate,
                    ).getFullYear();

                    const cost =
                        typeof currentValue.usedMaterialCost === "string"
                            ? parseFloat(currentValue.usedMaterialCost)
                            : currentValue.usedMaterialCost;

                    if (soldYear === year && soldMonth === month) {
                        accumulator[currentValue.materialName] =
                            (accumulator[currentValue.materialName] || 0) +
                            cost;
                    }
                    return accumulator;
                },
                {} as Record<string, number>,
            );

        const totalCurrentByMaterial = calcTotalByMaterialByMonth(
            currentYear,
            currentMonth,
        );
        const totalPreviousByMaterial = calcTotalByMaterialByMonth(
            previousYear,
            previousMonth,
        );
        console.log("Total Current Month:", totalCurrentByMaterial);
        console.log("Total Previous Month:", totalPreviousByMaterial);

        /*****
         * Calculate top expense material and its change percent compared to previous month
         */
        const calcTopCurrentMaterialName = () => {
            if (!totalCurrentByMaterial) return undefined;

            return Object.entries(totalCurrentByMaterial).reduce(
                (max, [key, value]) =>
                    value > max.value ? { key, value } : max,
                { key: "", value: -Infinity },
            ).key;
        };

        const topCurrentName = calcTopCurrentMaterialName();
        console.log("Top Material Name This Month:", topCurrentName);

        /*****
         * Calculate total material cost for current month and its change percent compared to previous month
         */
        const calculateTotalThisMonth = () => {
            if (!totalCurrentByMaterial) return 0;

            return Object.values(totalCurrentByMaterial).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
        };
        const calculatedTotalPreviousMonth = () => {
            if (!totalPreviousByMaterial) return 0;

            return Object.values(totalPreviousByMaterial).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
        };
        const totalThisMonth = calculateTotalThisMonth();
        const totalPreviousMonth = calculatedTotalPreviousMonth();
        console.log("Total Material Cost This Month:", totalThisMonth);
        console.log("Total Material Cost Previous Month:", totalPreviousMonth);

        const changePercentForTotal =
            totalPreviousMonth === 0
                ? totalThisMonth === 0
                    ? 0
                    : 100
                : ((totalThisMonth - totalPreviousMonth) / totalPreviousMonth) *
                  100;

        setTotalExpensesThisMonth({
            total: totalThisMonth,
            changePercent: changePercentForTotal,
        });
    }, [usedMaterialPerSales]);

    const columns: Array<{
        key: keyof UsedMaterialPerSalesRow;
        header: string;
        render?: (
            value: UsedMaterialPerSalesRow[keyof UsedMaterialPerSalesRow],
            row: UsedMaterialPerSalesRow,
        ) => React.ReactNode;
    }> = [
        {
            key: "materialName",
            header: "Material Name",
        },
        {
            key: "usedMaterialCost",
            header: "Total Cost",
            render: (value) => (
                <span className="text-arvo-red-100">
                    ${Number(value).toFixed(2)}
                </span>
            ),
        },
        {
            key: "soldDate",
            header: "Sold Date",
            render: (value) => {
                if (typeof value === "string") {
                    return <span className="whitespace-nowrap">{value}</span>;
                }
                return <></>;
            },
        },
        {
            key: "salesNumber",
            header: "Sales Number",
            render: (value) => <>{`#${String(value).padStart(7, "0")}`}</>,
        },
        { key: "goodName", header: "Goods Name" },
    ];

    const tabledData: UsedMaterialPerSalesRow[] = (
        usedMaterialPerSales ?? []
    ).map((element, index) => ({
        id: index,
        ...element,
        soldDate: getDateForInputField(element.soldDate),
        actions: "",
    }));

    return (
        <BaseLayout title="Used Materials List">
            <div className="flex justify-between">
                <PageTitle
                    title="Material Expense"
                    info="Material Expense automatically tracks how much you’ve spent on materials used in your products."
                />
            </div>
            <div className="flex gap-6 py-2">
                <Metric
                    value={`${totalExpensesThisMonth?.total ? `$${Number(totalExpensesThisMonth.total).toFixed(2)}` : "-"}`}
                    changePercent={
                        totalExpensesThisMonth?.changePercent != null
                            ? Math.round(
                                  Number(totalExpensesThisMonth.changePercent),
                              )
                            : 0
                    }
                    topText="Monthly Material Expenses"
                    bottomText="compared to last month"
                    colorVariant={
                        totalExpensesThisMonth?.changePercent != null &&
                        Number(totalExpensesThisMonth.changePercent) < 0
                            ? "positive"
                            : "negative"
                    }
                />
            </div>
            <DataTable
                columns={columns}
                data={tabledData}
                detailRender={detailsRender}
                mobileVisibleKeys={[
                    "materialName",
                    "usedMaterialCost",
                    "soldDate",
                ]}
                sortOptions={[
                    {
                        key: "soldDate",
                        label: "Date (Newest → Oldest)",
                        order: "desc",
                    },
                    {
                        key: "soldDate",
                        label: "Date (Oldest → Newest)",
                        order: "asc",
                    },
                    {
                        key: "materialName",
                        label: "Name (A → Z)",
                        order: "asc",
                    },
                    {
                        key: "materialName",
                        label: "Name (Z → A)",
                        order: "desc",
                    },
                    {
                        key: "usedMaterialCost",
                        label: "Cost (High → Low)",
                        order: "desc",
                    },
                    {
                        key: "usedMaterialCost",
                        label: "Cost (Low → High)",
                        order: "asc",
                    },
                ]}
                filterOptions={tableFilterOptions}
                searchOption={{
                    key: "materialName",
                    label: "Material Name",
                }}
            />
        </BaseLayout>
    );
}
