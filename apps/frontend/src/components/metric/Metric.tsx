type MetricProps = {
    value: string;
    changePercent: number;
    topText: string;
    bottomText: string;
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
        textColor: "text-gray-500",
        bgColor: "bg-gray-100/10",
        borderColor: "border-gray-200",
        badgeBgColor: "bg-gray-600",
        trendIconSrc: "/icon/arrow-trend-upward.svg",
    },
};

const Metric = ({ value, changePercent, topText, bottomText }: MetricProps) => {
    const posneg =
        changePercent > 0
            ? "positive"
            : changePercent < 0
              ? "negative"
              : "neutral";
    const style = metricStyles[posneg];
    return (
        <>
            <div
                className={`${style.bgColor} border ${style.borderColor} rounded-xl px-4 py-3.5`}
            >
                <div>{topText}</div>
                <div className="flex gap-2 items-center">
                    <div
                        className={`${style.textColor} font-semibold text-2xl`}
                    >
                        {value}
                    </div>
                    <div
                        className={`${style.badgeBgColor} text-arvo-white-0 px-1 rounded-sm flex gap-1.5`}
                    >
                        <img
                            src={style.trendIconSrc}
                            alt=""
                            className="w-3.5 icon-white"
                        />
                        <div>{changePercent}%</div>
                    </div>
                </div>
                <div>{bottomText}</div>
            </div>
        </>
    );
};

export default Metric;
