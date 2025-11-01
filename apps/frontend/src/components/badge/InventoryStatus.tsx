import Badge from "./Badge";

type InventoryStatusProps = {
    statusKey: string;
};

type StatusStyleType = {
    textColor: string;
    bgColor: string;
    text: string;
};

const statusStyles: Record<string, StatusStyleType> = {
    lowStock: {
        textColor: "text-arvo-orange-100",
        bgColor: "bg-arvo-orange-50",
        text: "Low Stock",
    },
    outOfStock: {
        textColor: "text-arvo-red-100",
        bgColor: "bg-arvo-red-50",
        text: "Out of Stock",
    },
    sufficient: {
        textColor: "text-arvo-green-100",
        bgColor: "bg-arvo-green-20",
        text: "Sufficient",
    },
};

const InventoryStatus = ({ statusKey }: InventoryStatusProps) => {
    const style = statusStyles[statusKey] ?? statusStyles.default;
    return (
        <>
            <div data-status={statusKey}>
                <Badge
                    text={style.text}
                    className={`${style.textColor} ${style.bgColor} inline-block px-2.5 font-semibold py-0.5 rounded-lg`}
                />
            </div>
        </>
    );
};

export default InventoryStatus;
