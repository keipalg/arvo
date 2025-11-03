export const NOTIFICATION_TYPES = {
    PRODUCT_LOW_INVENTORY: "product_low_inventory",
    MATERIAL_LOW_INVENTORY: "material_low_inventory",
} as const;

export type NotificationType =
    (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
