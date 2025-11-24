import type { Notification } from "../../types/notifications";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

type NotificationItemProps = {
    notification: Notification;
    onClick: (id: string, typeKey: string | null) => void;
};

export const NotificationItem = ({
    notification,
    onClick,
}: NotificationItemProps) => {
    const handleClick = () => {
        onClick(notification.id, notification.typeKey);
    };

    const isOutOfStock =
        notification.typeKey === "product_out_of_stock_inventory" ||
        notification.typeKey === "material_out_of_stock_inventory";

    const dotColor = isOutOfStock ? "bg-arvo-red-100" : "bg-arvo-orange-100";

    return (
        <div
            className={`cursor-pointer border-b border-arvo-black-5`}
            onClick={handleClick}
        >
            <div className="flex gap-3 hover:bg-arvo-blue-50 rounded-[12px] p-2">
                {!notification.isRead && (
                    <span
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dotColor}`}
                    ></span>
                )}
                <div className="flex-1">
                    <p className="text-lg font-semibold text-arvo-black-100">
                        {notification.title}
                    </p>
                    <p className="mt-1 text-m text-arvo-black-100">
                        {notification.message}
                    </p>
                    <p className="mt-1 text-sm text-arvo-black-25">
                        {formatRelativeTime(notification.notifiedAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};
