import { MaterialsStatus } from "./constants/materialsStatuses.js";

export const getStatus = (threshold: number, quantity: number): string => {
    if (quantity < 1) {
        return MaterialsStatus.OutOfStock;
    } else if (quantity < threshold) {
        return MaterialsStatus.LowStock;
    } else {
        return MaterialsStatus.Sufficient;
    }
};

export const getTotalCost = (
    purchase_price: number,
    quantity: number,
): number => {
    return quantity * purchase_price;
};
