import Badge from "../badge/Badge";

type TypeBadgeProps = {
    id: string;
    name: string;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    isSelected?: boolean;
    canDelete?: boolean;
    isUsed?: boolean;
    index: number;
};

type TypeStyles = {
    textColor: string;
    bgColor: string;
    text?: string;
};

const typeStyles: Record<string, TypeStyles> = {
    type1: {
        textColor: "text-arvo-yellow-50",
        bgColor: "bg-arvo-yellow-100",
        text: "Pending",
    },
    type2: {
        textColor: "text-arvo-blue-20",
        bgColor: "bg-arvo-blue-80",
    },
    type3: {
        textColor: "text-arvo-green-80",
        bgColor: "bg-arvo-green-20",
    },
    type4: {
        textColor: "text-arvo-white-0",
        bgColor: "bg-arvo-black-10",
    },
    type5: {
        textColor: "text-arvo-purple-20",
        bgColor: "bg-arvo-purple-100",
    },
    type6: {
        textColor: "text-arvo-orange-100",
        bgColor: "bg-arvo-orange-50",
        text: "Shipped",
    },
    type7: {
        textColor: "text-[#177783]",
        bgColor: "bg-[#D4F4F8]",
    },
};

const TypeBadge = ({
    id,
    name,
    onSelect,
    onDelete,
    isSelected,
    isUsed = false,
    index,
}: TypeBadgeProps) => {
    const getStyleByIndex = (index: number) => {
        const styleKeys = Object.keys(typeStyles);
        const styleKey = styleKeys[index % styleKeys.length];
        return typeStyles[styleKey];
    };
    const orderedStyle = getStyleByIndex(index);

    return (
        <div
            className={`flex items-center gap-2 p-2 hover:bg-arvo-blue-80 cursor-pointer ${isSelected ? "bg-arvo-blue-20" : ""}`}
        >
            <div onClick={() => onSelect(id)} className="flex-1">
                <Badge
                    text={name}
                    className={`${orderedStyle.textColor} ${orderedStyle.bgColor}`}
                />
            </div>
            {!isUsed && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                    className="text-red-500 hover:text-red-700"
                >
                    <img
                        src="/icon/delete.svg"
                        alt="Delete"
                        className="w-4 h-4 cursor-pointer"
                    />
                </button>
            )}
        </div>
    );
};

export default TypeBadge;
