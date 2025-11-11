type MetricProps =
    | {
          message: string;
          value?: never;
          topText?: never;
          changePercent?: never;
          bottomText?: never;
          showPercentage?: never;
          colorVariant?: never;
      }
    | {
          message?: never;
          value: string;
          topText: string;
          changePercent?: number;
          bottomText?: string;
          showPercentage?: boolean;
          colorVariant?: "positive" | "negative" | "neutral";
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
        textColor: "text-arvo-blue-100",
        bgColor: "bg-arvo-blue-20",
        borderColor: "border-arvo-blue-80",
        badgeBgColor: "bg-arvo-blue-100",
        trendIconSrc: "/icon/arrow-trend-upward.svg",
    },
};

const Metric = (props: MetricProps) => {
    // When message is provided
    if ("message" in props && props.message) {
        return (
            <div className="bg-arvo-white-100 border border-arvo-black-5 rounded-2xl min-w-[200px] max-w-[320px] px-4 py-3.5">
                <div className="text-arvo-black-100 whitespace-normal break-words">
                    {props.message}
                </div>
            </div>
        );
    }

    // Regular metric display
    const {
        value,
        topText,
        changePercent,
        bottomText,
        showPercentage = true,
        colorVariant,
    } = props;

    const posneg = colorVariant
        ? colorVariant
        : changePercent !== undefined
          ? changePercent > 0
              ? "positive"
              : changePercent < 0
                ? "negative"
                : "neutral"
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
                {(showPercentage || bottomText) && (
                    <div className="flex gap-1 items-center">
                        {showPercentage && changePercent !== undefined && (
                            <div
                                className={`${style.badgeBgColor} text-arvo-white-0 px-1.5 rounded-[5px] flex gap-1.5`}
                            >
                                <img
                                    src={style.trendIconSrc}
                                    alt=""
                                    className="w-3 icon-white"
                                />
                                <div>
                                    {changePercent > 0
                                        ? "+"
                                        : changePercent < 0
                                          ? "-"
                                          : ""}
                                    {changePercent % 1 === 0
                                        ? `${Math.abs(changePercent)}%`
                                        : `${Math.abs(changePercent).toFixed(1)}%`}
                                </div>
                            </div>
                        )}
                        {bottomText && <div>{bottomText}</div>}
                    </div>
                )}
            </div>
        </>
    );
};

export default Metric;
