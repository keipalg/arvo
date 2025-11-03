import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { trpc, queryClient } from "../../utils/trpcClient";
import { NotificationItem } from "./NotificationItem";
import { NOTIFICATION_TYPE_ROUTES } from "../../utils/constants/notifications";

export const NotificationList = () => {
    const navigate = useNavigate();
    const {
        data: notifications,
        isLoading,
        refetch,
    } = useQuery(
        trpc.notification.list.queryOptions({
            page: 1,
            limit: 20,
        }),
    );

    const markAsReadMutation = useMutation(
        trpc.notification.markAsRead.mutationOptions({
            onSuccess: () => {
                // Refetch notifications and unread count after marking as read
                void refetch();
                void queryClient.invalidateQueries({
                    queryKey: trpc.notification.unreadCount.queryKey(),
                });
            },
        }),
    );

    const handleNotificationClick = (
        notificationId: string,
        typeKey: string | null,
    ) => {
        markAsReadMutation.mutate({ notificationId });

        // Navigate to the related page instead of to specific item
        if (typeKey) {
            const route = NOTIFICATION_TYPE_ROUTES[typeKey];
            if (route) {
                void navigate({ to: route });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-arvo-black-75">Loading...</p>
            </div>
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
                <p className="text-m font-semibold text-arvo-black-100">
                    No current alerts.
                </p>
                <p className="mt-1 text-m text-arvo-black-100">
                    Nothing to see yet... but check back soon!
                </p>
            </div>
        );
    }

    return (
        <div className="max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                />
            ))}
        </div>
    );
};
