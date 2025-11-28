type DashboardCardProps = {
    salesOverview: string | null;
    isLoading?: boolean;
    children?: React.ReactNode;
};

const DashboardCardDailyOverview = ({
    salesOverview,
    isLoading,
}: DashboardCardProps) => {
    const noInsights = !salesOverview || salesOverview.length === 0;

    if (isLoading) {
        return (
            <div className="rounded-2xl p-4 shadow-md bg-arvo-white-100 border-arvo-black-10 animate-pulse">
                <div className="p-4 flex items-center">
                    <div className="flex flex-col w-full gap-3">
                        <div className="h-6 w-40 bg-arvo-black-10 rounded-md"></div>
                        <div className="h-12 w-full bg-arvo-black-10 rounded-md"></div>
                        <div className="h-4 w-32 bg-arvo-black-10 rounded-md"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-2xl p-4 shadow-md ${
                noInsights
                    ? "bg-arvo-black-5"
                    : "bg-arvo-blue-20 border-arvo-blue-100 border"
            }`}
        >
            <div className="p-4 flex items-center">
                <div className="flex flex-col">
                    <div
                        className={`flex gap-2 border rounded-4xl px-6 py-2 items-center ${
                            noInsights
                                ? "bg-arvo-black-100"
                                : "border-arvo-blue-100"
                        }`}
                    >
                        <img
                            src={`${noInsights ? "/icon/ai-black.svg" : "/icon/ai-blue.svg"}`}
                        />
                        <span
                            className={`font-semibold ${noInsights ? "text-arvo-white-0" : "text-arvo-blue-100"}`}
                        >
                            {noInsights ? "No insights yet." : "Weekly info"}
                        </span>
                    </div>
                    <p
                        className={`text-2xl py-8 font-semibold ${noInsights ? "text-arvo-black-100" : "text-arvo-blue-100"}`}
                    >
                        {salesOverview ??
                            "Once your data builds up, AI will start generating trends and recommendations here."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardCardDailyOverview;
