import { z } from "zod";

export const salesInputValidation = z
    .object({
        customer: z.string().nonempty("Customer is required"),
        salesNumber: z.number(),
        channelId: z.uuidv7(),
        date: z.string(),
        products: z
            .array(
                z.object({
                    productId: z.uuidv7().min(1, "Product is required"),
                    quantity: z.number().min(1, "Quantity must be at least 1"),
                    retailPrice: z
                        .number()
                        .min(0, "Retail price must be at least 0"),
                }),
            )
            .min(1, "At least one product is required"),
        statusKey: z.string(),
        totalPrice: z.number().min(0, "Total price must be at least 0"),
        note: z.string().optional(),
        discount: z.number().min(0, "Discount must be at least 0"),
        shippingFee: z.number().min(0, "Shipping Fee must be at least 0"),
        taxPercentage: z.number().min(0, "Tax Percentage must be at least 0"),
    })
    .refine(
        (data) =>
            new Set(data.products.map((p) => p.productId)).size ===
            data.products.length,
        { message: "Products cannot be duplicated", path: ["products"] },
    );

export type SalesInput = z.infer<typeof salesInputValidation>;

export const salesUpdateValidation = z
    .object({
        id: z.uuidv7("Invalid sale ID"),
        customer: z.string().nonempty("Customer is required"),
        salesNumber: z.number(),
        channelId: z.uuidv7(),
        date: z.string(),
        products: z
            .array(
                z.object({
                    productId: z.uuidv7().min(1, "Product is required"),
                    quantity: z.number().min(1, "Quantity must be at least 1"),
                    retailPrice: z
                        .number()
                        .min(0, "Retail price must be at least 0"),
                }),
            )
            .min(1, "At least one product is required"),
        statusKey: z.string(),
        totalPrice: z.number().min(0, "Total price must be at least 0"),
        note: z.string().optional(),
        discount: z.number().min(0, "Discount must be at least 0"),
        shippingFee: z.number().min(0, "Shipping Fee must be at least 0"),
        taxPercentage: z.number().min(0, "Tax Percentage must be at least 0"),
    })
    .refine(
        (data) =>
            new Set(data.products.map((p) => p.productId)).size ===
            data.products.length,
        { message: "Products cannot be duplicated", path: ["products"] },
    );

export type SalesUpdateInput = z.infer<typeof salesUpdateValidation>;
