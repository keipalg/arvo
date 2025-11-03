export const NOTIFICATION_TYPES = {
    PRODUCT_LOW_INVENTORY: "product_low_inventory",
    MATERIAL_LOW_INVENTORY: "material_low_inventory",
} as const;

export type NotificationType =
    (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// TODO - if need to navigate to page upon notification click
export const NOTIFICATION_TYPE_ROUTES: Record<string, string> = {
    [NOTIFICATION_TYPES.PRODUCT_LOW_INVENTORY]: "/goods",
    [NOTIFICATION_TYPES.MATERIAL_LOW_INVENTORY]: "/materials",
};
