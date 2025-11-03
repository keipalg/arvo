export type Notification = {
    id: string;
    userId: string;
    type_id: string;
    typeKey: string | null;
    title: string;
    message: string;
    notifiedAt: Date;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type NotificationListResponse = {
    notifications: Notification[];
    total?: number;
};
