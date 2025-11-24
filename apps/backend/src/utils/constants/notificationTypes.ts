export const NOTIFICATION_TYPES = {
    PRODUCT_LOW_INVENTORY: "product_low_inventory",
    PRODUCT_OUT_OF_STOCK_INVENTORY: "product_out_of_stock_inventory",
    MATERIAL_LOW_INVENTORY: "material_low_inventory",
    MATERIAL_OUT_OF_STOCK_INVENTORY: "material_out_of_stock_inventory",
} as const;

export type NotificationType =
    (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
