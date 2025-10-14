import { z } from "zod";

export const salesInputValidation = z.object({
    customer: z.string().nonempty("Customer is required"),
    salesNumber: z.number(),
    channelId: z.uuidv7(),
    date: z.string(),
    products: z
        .array(
            z.object({
                productId: z.uuidv7().nonempty("Product ID is required"),
                quantity: z.number().min(1, "Quantity must be at least 1"),
                retailPrice: z.string().nonempty("Retail Price is required"),
            }),
        )
        .min(1, "At least one product is required"),
    statusKey: z.string(),
    totalPrice: z.string(),
    note: z.string().optional(),
    discount: z.string().optional(),
    shippingFee: z.string().optional(),
    taxPercentage: z.string().optional(),
});

export type SalesInput = z.infer<typeof salesInputValidation>;
