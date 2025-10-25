import type { SalesInput } from "shared/validation/salesValidation.js";

export const isProductsError = (
    input: SalesInput,
    dbProducts: {
        retailPrice: number;
        id: string;
        name: string;
        inventoryQuantity: number | null;
    }[],
) => {
    // Check number of products
    if (input.products.length !== dbProducts.length) {
        return true;
    }

    // Check each product
    for (const inputProduct of input.products) {
        const dbProduct = dbProducts.find(
            (p) => p.id === inputProduct.productId,
        );
        if (!dbProduct) {
            console.log("Product not found:", inputProduct.productId);
            return true;
        }

        if (Math.abs(dbProduct.retailPrice - inputProduct.retailPrice) > 0.01) {
            console.log(
                "Price mismatch for product:",
                inputProduct.productId,
                "Input price:",
                inputProduct.retailPrice,
                "DB price:",
                dbProduct.retailPrice,
            );
            return true;
        }

        if (
            dbProduct.inventoryQuantity != null &&
            inputProduct.quantity > dbProduct.inventoryQuantity
        ) {
            console.log(
                "Insufficient inventory for product:",
                inputProduct.productId,
                "Requested quantity:",
                inputProduct.quantity,
                "Available quantity:",
                dbProduct.inventoryQuantity,
            );
            return true;
        }
    }
};

export const isTotalPriceError = (input: SalesInput) => {
    const subtotal = input.products.reduce(
        (sum, product) => sum + product.retailPrice * product.quantity,
        0,
    );

    const discount = input.discount ?? 0;
    const shippingFee = input.shippingFee ?? 0;
    const tax = input.taxPercentage ?? 0;
    const calculatedTotalPrice =
        (subtotal - discount + shippingFee) * (1 + tax / 100);

    if (Math.abs(calculatedTotalPrice - Number(input.totalPrice)) > 0.01) {
        console.log("Subtotal:", subtotal, "Discount:", discount, "Tax:", tax);
        console.log(
            "Total price mismatch:",
            "Calculated total price:",
            calculatedTotalPrice,
            "Input total price:",
            input.totalPrice,
        );
        return true;
    }

    return false;
};
