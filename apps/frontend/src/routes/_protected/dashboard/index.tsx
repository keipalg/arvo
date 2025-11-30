import { createFileRoute } from "@tanstack/react-router";
import {
    Chart as ChartJS,
    CategoryScale,
    LineController,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
    type TooltipItem,
} from "chart.js";
import { Bar, Chart, Doughnut } from "react-chartjs-2";
import BaseLayout from "../../../components/BaseLayout";
import PageTitle from "../../../components/layout/PageTitle";
import Metric from "../../../components/metric/Metric";
import { useAuthSession } from "../../../auth/authSession";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../../utils/trpcClient";
import DashboardCard from "../../../components/card/DashboardCard";
import TopSellingTable from "../../../components/table/TopSellingTable";
import ChartContainer from "../../../components/chart/ChartContainer";
import DashboardCardDailyOverview from "../../../components/card/DashboardCardDailyOverview";
import MetricsGroup from "../../../components/metric/MetricsGroup";
import { formatPrice } from "../../../utils/formatPrice";

export const Route = createFileRoute("/_protected/dashboard/")({
    component: RouteComponent,
});

ChartJS.register(
    CategoryScale,
    LineController,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
);

ChartJS.defaults.font.family =
    "National Park, system-ui, Avenir, Helvetica, Arial, sans-serif";

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            ticks: {
                maxTicksLimit: 6,
            },
        },
    },
};

const revenueProfitSummaryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: (context: TooltipItem<"bar">) => {
                    return `${formatPrice(context.parsed.y ?? 0)}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            ticks: {
                maxTicksLimit: 6,
            },
        },
    },
};

const revenueProfitSummary6MonthsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top" as const,
        },
        tooltip: {
            callbacks: {
                label: (context: TooltipItem<"bar" | "line">) => {
                    return `${formatPrice(context.parsed.y ?? 0)}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            ticks: {
                maxTicksLimit: 6,
            },
        },
    },
};

const expenseBreakdownChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "right" as const,
            labels: {
                usePointStyle: true,
                boxWidth: 14,
                boxHeight: 14,
                padding: 20,
                font: {
                    family: "National Park, system-ui, Avenir, Helvetica, Arial, sans-serif",
                    size: 14,
                    weight: "bold" as const,
                },
            },
        },
        tooltip: {
            callbacks: {
                label: (context: TooltipItem<"doughnut">) => {
                    return `${formatPrice(context.parsed)}`;
                },
            },
        },
    },
};

function RouteComponent() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data: session } = useAuthSession();
    const { data: revenueProfitSummaryData } = useQuery(
        trpc.dashboard.revenueProfitSummary.queryOptions({ timezone }),
    );
    const { data: revenueProfitSummaryOverview } = useQuery(
        trpc.dashboard.revenueProfitSummaryOverview.queryOptions(
            {
                totalRevenue: revenueProfitSummaryData?.totalRevenue ?? 0,
                totalExpenses: revenueProfitSummaryData?.totalExpenses ?? 0,
                totalProfit:
                    (revenueProfitSummaryData?.totalRevenue ?? 0) -
                    (revenueProfitSummaryData?.totalExpenses ?? 0),
            },
            { enabled: !!revenueProfitSummaryData },
        ),
    );

    const { data: revenueProfitSummary6MonthsData } = useQuery(
        trpc.dashboard.revenueProfitSummary6Months.queryOptions({ timezone }),
    );

    const revenueProfitSummary6MonthsDataMapped =
        revenueProfitSummary6MonthsData?.map((d) => ({
            month: d.month,
            totalRevenue: d.totalRevenue,
            totalExpenses: d.totalRevenue - d.totalProfit,
            totalProfit: d.totalProfit,
        })) ?? [];

    const { data: revenueProfitSummary6MonthsOverview } = useQuery(
        trpc.dashboard.revenueProfitSummary6MonthsOverview.queryOptions(
            {
                revenueProfitSummary6MonthsData:
                    revenueProfitSummary6MonthsDataMapped,
            },
            { enabled: !!revenueProfitSummary6MonthsData },
        ),
    );

    const { data: topSellingProductsData } = useQuery(
        trpc.dashboard.topSellingProducts.queryOptions({
            limit: 3,
            timezone,
        }),
    );

    const { data: lowSellingProductsData } = useQuery(
        trpc.dashboard.lowSellingProducts.queryOptions({
            limit: 3,
            timezone,
        }),
    );

    const { data: expenseBreakdownData } = useQuery(
        trpc.dashboard.expenseBreakdown.queryOptions({ timezone }),
    );

    const { data: expenseBreakdownOverview } = useQuery(
        trpc.dashboard.expenseBreakdownOverview.queryOptions(
            {
                expenseBreakdownData: expenseBreakdownData ?? [],
            },
            { enabled: !!expenseBreakdownData },
        ),
    );

    const { data: productionInOutData } = useQuery(
        trpc.dashboard.productionInOut.queryOptions({ timezone }),
    );

    const { data: productionInOutOverview } = useQuery(
        trpc.dashboard.productionInOutOverview.queryOptions(
            {
                totalProduced: productionInOutData?.totalProduced ?? 0,
                totalSold: productionInOutData?.totalSold ?? 0,
            },
            { enabled: !!productionInOutData },
        ),
    );

    const { data: metricRevenue, isLoading: metricRevenueIsLoading } = useQuery(
        trpc.sales.metricTotalRevenue.queryOptions({ timezone }),
    );
    const { data: metricSalesCount, isLoading: metricSalesCountIsLoading } =
        useQuery(trpc.sales.metricTotalSalesCount.queryOptions({ timezone }));

    const { data: dailyOverviews, isLoading: dailyOverviewsIsLoading } =
        useQuery(trpc.dashboard.dailyOverviews.queryOptions({ timezone }));

    const revenueProfitSummaryChartData = {
        labels: ["Revenue", "Expenses", "Profit"],
        datasets: [
            {
                label: "Amount",
                data: [
                    revenueProfitSummaryData?.totalRevenue ?? 0,
                    revenueProfitSummaryData?.totalExpenses ?? 0,
                    (revenueProfitSummaryData?.totalRevenue ?? 0) -
                        (revenueProfitSummaryData?.totalExpenses ?? 0),
                ],
                backgroundColor: ["#2D42C9", "#F3BFBF", "#F0742F"],
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
            },
        ],
    };

    const revenueProfitSummary6MonthsChartData = {
        labels: revenueProfitSummary6MonthsData?.map((d) => d.month) ?? [],
        datasets: [
            {
                label: "Revenue",
                type: "bar" as const,
                data:
                    revenueProfitSummary6MonthsData?.map(
                        (d) => d.totalRevenue,
                    ) ?? [],
                backgroundColor: ["#2D42C9"],
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
                order: 2,
            },
            {
                label: "Expenses",
                type: "bar" as const,
                data:
                    revenueProfitSummary6MonthsData?.map(
                        (d) => d.totalRevenue - d.totalProfit,
                    ) ?? [],
                backgroundColor: ["#F3BFBF"],
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
                order: 2,
            },
            {
                label: "Profit",
                type: "line" as const,
                data:
                    revenueProfitSummary6MonthsData?.map(
                        (d) => d.totalProfit,
                    ) ?? [],
                pointRadius: 4,
                pointHoverRadius: 6,
                backgroundColor: "#F0742F",
                borderColor: "#F0742F",
                borderWidth: 4,
                order: 1,
            },
        ],
    };

    const expenseBreakdownDataChartData = {
        labels: expenseBreakdownData?.map((d) => d.expenseTypeLabel) ?? [],
        datasets: [
            {
                label: "Expense",
                data: expenseBreakdownData?.map((d) => d.totalExpense) ?? [],
                backgroundColor: [
                    "#2D42C9",
                    "#F0742F",
                    "#FFA200",
                    "#267F53",
                    "#FA4B42",
                    "#EE60E0",
                ],
                pointStyle: "circle",
                unit: "$",
            },
        ],
    };

    const productionInOutChartData = {
        labels: ["Products Produced", "Products Sold"],
        datasets: [
            {
                label: "Items",
                data: [
                    productionInOutData?.totalProduced ?? 0,
                    productionInOutData?.totalSold ?? 0,
                ],
                backgroundColor: ["#2D42C9", "#FDC841"],
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
            },
        ],
    };

    const noMetricsAvailable =
        !metricRevenueIsLoading &&
        !metricSalesCountIsLoading &&
        !metricRevenue?.totalProfit &&
        !metricRevenue?.totalRevenue &&
        !metricSalesCount?.totalSalesCount;

    return (
        <BaseLayout title="Dashboard">
            <PageTitle title={`Hello ${session ? session.user.name : ""}`} />
            <p className="font-semibold text-arvo-black-50 mt-4">
                Let’s take a look at how your business is growing.
            </p>
            <MetricsGroup noMetricsAvailable={noMetricsAvailable}>
                <Metric
                    value={
                        metricRevenue
                            ? `$${Number(metricRevenue.totalProfit).toFixed(0)}`
                            : "-"
                    }
                    changePercent={metricRevenue?.profitChange ?? 0}
                    topText="Total Profit"
                    bottomText="compared to last month"
                    showPercentage={metricRevenue?.profitChange != null}
                />
                <Metric
                    value={
                        metricRevenue
                            ? `$${Number(metricRevenue.totalRevenue).toFixed(0)}`
                            : "-"
                    }
                    changePercent={metricRevenue?.change ?? 0}
                    topText="Total Revenue"
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
                    topText="Total Products Sold"
                    bottomText="compared to last month"
                    showPercentage={metricSalesCount?.change != null}
                />
            </MetricsGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <DashboardCardDailyOverview
                    salesOverview={dailyOverviews?.salesOverview ?? null}
                    isLoading={dailyOverviewsIsLoading}
                ></DashboardCardDailyOverview>
                <DashboardCard
                    title="Your Monthly Sales, Costs & Earnings"
                    description="Your finances at a glance — earnings, costs, and profit all in one place."
                    overview={
                        revenueProfitSummaryOverview
                            ? String(revenueProfitSummaryOverview.overview)
                            : ""
                    }
                >
                    <ChartContainer>
                        <Bar
                            options={revenueProfitSummaryChartOptions}
                            data={revenueProfitSummaryChartData}
                        />
                    </ChartContainer>
                </DashboardCard>
                <DashboardCard
                    title="Your Business Performance Over Time"
                    description="A look at how your income and profit shaped up this half of the year."
                    overview={
                        revenueProfitSummary6MonthsOverview?.overview ?? ""
                    }
                    className="sm:col-span-2"
                >
                    <ChartContainer>
                        <Chart
                            key="revenue-profit-summary-6-months-chart"
                            type="bar"
                            options={revenueProfitSummary6MonthsChartOptions}
                            data={revenueProfitSummary6MonthsChartData}
                        ></Chart>
                    </ChartContainer>
                </DashboardCard>
                <DashboardCard
                    title="Top Selling Products"
                    description="Your best-performing items this period."
                >
                    <TopSellingTable data={topSellingProductsData ?? []} />
                </DashboardCard>
                <DashboardCard
                    title="Low-Selling Products"
                    description="Slow sellers — great for a little boost."
                >
                    <TopSellingTable data={lowSellingProductsData ?? []} />
                </DashboardCard>
                <DashboardCard
                    title="Your Expense Breakdown"
                    description="See where your money went this month."
                    overview={expenseBreakdownOverview?.overview ?? ""}
                >
                    <ChartContainer>
                        <Doughnut
                            options={expenseBreakdownChartOptions}
                            data={expenseBreakdownDataChartData}
                        />
                    </ChartContainer>
                </DashboardCard>
                <DashboardCard
                    title="Product In, Product Out"
                    description="See if you’re making more than you’re selling."
                    overview={productionInOutOverview?.overview ?? ""}
                >
                    <ChartContainer>
                        <Bar
                            options={options}
                            data={productionInOutChartData}
                        />
                    </ChartContainer>
                </DashboardCard>
            </div>
        </BaseLayout>
    );
}
