type MetricProps = {
    value: string;
    changePercent: number;
    topText: string;
    bottomText: string;
    showPercentage?: boolean;
    styleOverride?: "positive" | "negative" | "neutral";
};

type MetricStyleType = {
    textColor: string;
    bgColor: string;
    borderColor: string;
    badgeBgColor: string;
    trendIconSrc: string;
};

const metricStyles: Record<string, MetricStyleType> = {
    positive: {
        textColor: "text-arvo-green-100",
        bgColor: "bg-arvo-green-20",
        borderColor: "border-arvo-green-50",
        badgeBgColor: "bg-arvo-green-100",
        trendIconSrc: "/icon/arrow-trend-upward.svg",
    },
    negative: {
        textColor: "text-arvo-orange-100",
        bgColor: "bg-arvo-yellow-50",
        borderColor: "border-arvo-orange-50",
        badgeBgColor: "bg-arvo-orange-100",
        trendIconSrc: "/icon/arrow-trend-downward.svg",
    },
    neutral: {
        textColor: "text-arvo-black-100",
        bgColor: "bg-arvo-white-100",
        borderColor: "border-arvo-black-50",
        badgeBgColor: "bg-arvo-black-100",
        trendIconSrc: "/icon/arrow-trend-upward.svg",
    },
};

const Metric = ({
    value,
    changePercent,
    topText,
    bottomText,
    showPercentage = true,
    styleOverride,
}: MetricProps) => {
    const posneg = styleOverride
        ? styleOverride
        : changePercent > 0
          ? "positive"
          : changePercent < 0
            ? "negative"
            : "neutral";
    const style = metricStyles[posneg];
    return (
        <>
            <div
                className={`${style.bgColor} border ${style.borderColor} rounded-2xl min-w-fit px-4 py-3.5`}
            >
                <div>{topText}</div>
                <div
                    className={`${style.textColor} pb-1 font-semibold text-2xl`}
                >
                    {value}
                </div>
                <div className="flex gap-1 items-center">
                    {showPercentage && (
                        <div
                            className={`${style.badgeBgColor} text-arvo-white-0 px-1.5 rounded-[5px] flex gap-1.5`}
                        >
                            <img
                                src={style.trendIconSrc}
                                alt=""
                                className="w-3 icon-white"
                            />
                            <div>{changePercent.toFixed(2)}%</div>
                        </div>
                    )}
                    <div>{bottomText}</div>
                </div>
            </div>
        </>
    );
};

export default Metric;
