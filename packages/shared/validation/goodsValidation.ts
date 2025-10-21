import { z } from "zod";

export const goodsInputValidation = z.object({
    name: z.string().nonempty("Product name is required"),
    productTypeId: z.uuid(),
    inventoryQuantity: z.number(),
    retailPrice: z.number(),
    note: z.string().optional(),
    minimumStockLevel: z.number(),

    materials: z.array(
        z.object({
            materialId: z.uuid().nonempty("Material ID is required"),
            amount: z.number().min(0.01, "amount must be at least 1"),
        }),
    ),
    // TODO: how to do for image?
});

export type GoodsInput = z.infer<typeof goodsInputValidation>;
