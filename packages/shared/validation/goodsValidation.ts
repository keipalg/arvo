import { z } from "zod";

export const goodsInputValidation = z.object({
    name: z.string().nonempty("Product name is required"),
    // productTypeId: z.uuid(),
    inventoryQuantity: z.number(),
    retailPrice: z.number(),
    note: z.string().optional(),
    // TODO: how to do for image?
});

export type GoodsInput = z.infer<typeof goodsInputValidation>;
