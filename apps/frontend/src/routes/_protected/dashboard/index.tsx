import { createFileRoute } from "@tanstack/react-router";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
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

export const Route = createFileRoute("/_protected/dashboard/")({
    component: RouteComponent,
});

ChartJS.register(
    CategoryScale,
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
    },
};

const revenueProfitSummaryChartOptions = {
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
    },
};

const revenueProfitSummary6MonthsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top" as const,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
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
                font: {
                    family: "National Park, system-ui, Avenir, Helvetica, Arial, sans-serif",
                    size: 14,
                    weight: "bold" as const,
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
    const { data: revenueProfitSummary6MonthsData } = useQuery(
        trpc.dashboard.revenueProfitSummary6Months.queryOptions({ timezone }),
    );
    const { data: topSellingProductsData } = useQuery(
        trpc.dashboard.topSellingProducts.queryOptions({ timezone }),
    );

    const { data: lowSellingProductsData } = useQuery(
        trpc.dashboard.lowSellingProducts.queryOptions({ timezone }),
    );

    const { data: expenseBreakdownData } = useQuery(
        trpc.dashboard.expenseBreakdown.queryOptions({ timezone }),
    );

    const { data: productionInOutData } = useQuery(
        trpc.dashboard.productionInOut.queryOptions({ timezone }),
    );

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
                backgroundColor: [
                    "#2B72FB",
                    "#64BDC6",
                    "#EECA34",
                    "#FE6A35",
                    "#FA4B42",
                    "#EE60E0",
                ],
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
            },
            // {
            //     label: "Profit Margin",
            //     type: "line" as const,
            //     data:
            //         revenueProfitSummary6MonthsData?.map(
            //             (d) => d.profitMargin,
            //         ) ?? [],
            // }
        ],
    };

    const expenseBreakdownDataChartData = {
        labels: expenseBreakdownData?.map((d) => d.expenceType) ?? [],
        datasets: [
            {
                label: "Expense",
                data: expenseBreakdownData?.map((d) => d.totalExpense) ?? [],
                backgroundColor: [
                    "#2B72FB",
                    "#64BDC6",
                    "#EECA34",
                    "#FE6A35",
                    "#FA4B42",
                    "#EE60E0",
                ],
                pointStyle: "circle",
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
                backgroundColor: ["#2D42C9", "#F0742F"],
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                    bottomLeft: 0,
                    bottomRight: 0,
                },
            },
        ],
    };

    return (
        <BaseLayout title="Dashboard">
            <PageTitle title={`Hello ${session ? session.user.name : ""}`} />
            <p>Let’s take a look at how your business is growing.</p>
            <div className="flex gap-6 py-2">
                <Metric
                    value={`${String(40)} %`}
                    changePercent={8}
                    topText="Total Profit"
                    bottomText="compared to last mont"
                ></Metric>
                <Metric
                    value={`${String(6)} items`}
                    changePercent={15}
                    topText="Total Sales"
                    bottomText="since last month"
                ></Metric>
                <Metric
                    value={`${String(50)} items`}
                    changePercent={50}
                    topText="Total sold products"
                    bottomText="since last month"
                ></Metric>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <DashboardCard>
                    <p className="text-lg font-semibold">
                        Sales grew 15% today, with Daisy Mugs leading again.
                        <br />
                        <br />
                        Keep the momentum going!
                        <br />
                    </p>
                </DashboardCard>
                <DashboardCard
                    title="Your Monthly Sales, Costs & Earnings"
                    description="Your finances at a glance — earnings, costs, and profit all in one place."
                    overview="Great month! Sales have grown by 23% and expenses held steady at $ 2,340.
                        Your overall profit margins remain at 57%, which is within industry average for pottery / ceramics."
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
                    overview="Great momentum! Over the past 6 months, revenue has fluctuated, peaking at $ 550 April and dipping at $ 300 June, while expenses remained mostly stable. Profit margins are averaging 00%, indicating that occasional dips haven’t severely impacted overall performance."
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
                    overview="You sold more than you made — looks like demand’s catching up fast. Time to plan your next batch."
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
