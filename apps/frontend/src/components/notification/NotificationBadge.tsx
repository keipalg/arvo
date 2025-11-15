import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";

type NotificationBadgeProps = {
    isActive: boolean;
};

export const NotificationBadge = ({ isActive }: NotificationBadgeProps) => {
    const { data: unreadCount } = useQuery(
        trpc.notification.unreadCount.queryOptions(undefined, {
            refetchInterval: 30000, // Auto refresh every 30 seconds
        }),
    );

    const hasUnread = unreadCount !== undefined && unreadCount > 0;

    // Determine which icon to show based on active state and unread count
    const getIconPath = () => {
        if (isActive && hasUnread) {
            return "/icon/notification-unread-active.svg";
        }
        if (isActive && !hasUnread) {
            return "/icon/notification-active.svg";
        }
        if (!isActive && hasUnread) {
            return "/icon/notification-unread.svg";
        }
        return "/icon/notification.svg";
    };

    return (
        <img
            src={getIconPath()}
            alt="Notification"
            className="w-9 h-9 max-sm:w-10 max-sm:h-10"
        />
    );
};
