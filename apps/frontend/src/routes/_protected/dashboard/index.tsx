import { createFileRoute } from "@tanstack/react-router";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { faker } from "@faker-js/faker";
import { Bar } from "react-chartjs-2";
import BaseLayout from "../../../components/BaseLayout";
import PageTitle from "../../../components/layout/PageTitle";
import { authClient } from "../../../auth/auth-client";
import Metric from "../../../components/metric/Metric";

export const Route = createFileRoute("/_protected/dashboard/")({
    component: RouteComponent,
});

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const,
        },
        title: {
            display: true,
            text: "Bar Chart",
        },
    },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const data = {
    labels,
    datasets: [
        {
            label: "Dataset 1",
            data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
            label: "Dataset 2",
            data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
    ],
};

function RouteComponent() {
    const { data: session } = authClient.useSession();

    return (
        <BaseLayout title="Dashboard">
            <PageTitle title={`Hello ${session?.user.name}`} />
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
            <Bar options={options} data={data} />
        </BaseLayout>
    );
}
