import Badge from "./Badge";

type SalesStatusProps = {
    statusKey: string;
};

type StatusStyleType = {
    textColor: string;
    bgColor: string;
    text: string;
};

const statusStyles: Record<string, StatusStyleType> = {
    pending: {
        textColor: "text-arvo-yellow-50",
        bgColor: "bg-arvo-yellow-100",
        text: "Pending",
    },
    inProgress: {
        textColor: "text-arvo-blue-20",
        bgColor: "bg-arvo-blue-80",
        text: "In-Progress",
    },
    itemComplete: {
        textColor: "text-arvo-green-80",
        bgColor: "bg-arvo-green-20",
        text: "Item Complete",
    },
    orderComplete: {
        textColor: "text-arvo-white-0",
        bgColor: "bg-arvo-black-10",
        text: "Order Complete",
    },
    packaged: {
        textColor: "text-arvo-purple-20",
        bgColor: "bg-arvo-purple-100",
        text: "Packaged",
    },
    shipped: {
        textColor: "text-arvo-orange-100",
        bgColor: "bg-arvo-orange-50",
        text: "Shipped",
    },
    arrivalConfirmation: {
        textColor: "text-[#177783]",
        bgColor: "bg-[#D4F4F8]",
        text: "Arrival Confirmation",
    },
    default: {
        textColor: "text-gray-800",
        bgColor: "bg-gray-200",
        text: "Default",
    },
};

const SalesStatus = ({ statusKey }: SalesStatusProps) => {
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

export default SalesStatus;
