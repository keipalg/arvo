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
    cost_per_unit: number,
    quantity: number,
): number => {
    return quantity * cost_per_unit;
};

export const getCostPerUnit = (
    purchase_price: number,
    quantity: number,
): number => {
    return purchase_price / quantity;
};

export const getQuantityWithUnit = (
    quanity: number,
    unitAbv: string,
): string => {
    return `${quanity} ${unitAbv}`;
};
