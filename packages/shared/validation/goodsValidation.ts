import { z } from "zod";

export const goodsInputValidation = z.object({
    name: z.string().nonempty("Product name is required"),
    productTypeId: z.uuid().nonempty("Product Type is required"),
    image: z.string().optional(),
    inventoryQuantity: z.number().min(0, "Stock level must be at least 0"),
    retailPrice: z.number().min(0.01, "Retail price must be at least $0.01"),
    note: z.string().optional(),
    minimumStockLevel: z
        .number()
        .min(0, "Minimum stock level must be at least 0"),
    materialCost: z.number().min(0.01, "Material per Item must be filled."),
    laborCost: z.number(),
    overheadCost: z.number(),
    operatingCost: z.number(),
    netProfit: z.number(),

    materials: z.array(
        z.object({
            materialId: z.uuid().nonempty("Material ID is required"),
            amount: z.number().min(0.01, "amount must be at least 1"),
        }),
    ),
});

export type GoodsInput = z.infer<typeof goodsInputValidation>;

export const goodsUpdateValidation = z.object({
    id: z.uuid("Invalid good ID"),
    name: z.string().nonempty("Product name is required"),
    productTypeId: z.uuid().nonempty("Product Type is required"),
    image: z.string().optional(),
    inventoryQuantity: z.number().min(0, "Stock level must be at least 0"),
    retailPrice: z.number().min(0.01, "Retail price must be at least $0.01"),
    note: z.string().optional(),
    minimumStockLevel: z
        .number()
        .min(0, "Minimum stock level must be at least 0"),
    materialCost: z.number(),
    laborCost: z.number(),
    overheadCost: z.number(),
    operatingCost: z.number(),
    netProfit: z.number(),

    materials: z.array(
        z.object({
            materialId: z.uuid().nonempty("Material ID is required"),
            amount: z.number().min(0.01, "amount must be at least 1"),
        }),
    ),
});

export type GoodsUpdateInput = z.infer<typeof goodsUpdateValidation>;
