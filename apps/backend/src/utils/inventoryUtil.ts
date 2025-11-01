import { InventoryStatus } from "./constants/inventoryStatus.js";

export const getStatus = (threshold: number, quantity: number): string => {
    if (quantity < 1) {
        return InventoryStatus.OutOfStock;
    } else if (quantity < threshold) {
        return InventoryStatus.LowStock;
    } else {
        return InventoryStatus.Sufficient;
    }
};
