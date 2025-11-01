import Badge from "./Badge";

type ProductionStatusProps = {
    statusKey: string;
};

type StatusStyleType = {
    textColor: string;
    bgColor: string;
    text: string;
};

const statusStyles: Record<string, StatusStyleType> = {
    inProgress: {
        textColor: "text-arvo-blue-20",
        bgColor: "bg-arvo-blue-80",
        text: "In-Progress",
    },
    completed: {
        textColor: "text-arvo-green-80",
        bgColor: "bg-arvo-green-20",
        text: "Completed",
    },
    default: {
        textColor: "text-gray-800",
        bgColor: "bg-gray-200",
        text: "Default",
    },
};

const ProductionStatus = ({ statusKey }: ProductionStatusProps) => {
    const style = statusStyles[statusKey] ?? statusStyles.default;
    return (
        <>
            <div data-status={statusKey}>
                <Badge
                    text={style.text}
                    className={`${style.textColor} ${style.bgColor}`}
                />
            </div>
        </>
    );
};

export default ProductionStatus;
