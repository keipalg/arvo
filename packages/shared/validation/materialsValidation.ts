import { z } from "zod";

export const addMaterialsValidation = z.object({
    name: z.string().nonempty("Item name is required"),
    typeId: z.uuidv7("Type is required"),
    unit: z.string().nonempty("Unit is required"),
    quantity: z
        .number()
        .nonnegative("Quantity should be positive")
        .nonoptional("Quantity is required"),
    purchasePrice: z
        .number()
        .nonnegative("Purchase price should be positive")
        .nonoptional("Purchase price is required"),
    minStockLevel: z
        .number()
        .nonnegative("Minimum stock level should be positive"),
    lastPurchaseDate: z.string().nonempty("Purchase date is required"),
    supplierName: z.string().optional(),
    notes: z.string().optional(),
});

export const updateMaterialsValidation = z.object({
    id: z.uuid("Invalid material ID"),
    name: z.string().nonempty("Item name is required"),
    typeId: z.uuidv7("Type is required"),
    unit: z.string().nonempty("Unit is required"),
    quantity: z
        .number()
        .nonnegative("Quantity should be positive")
        .nonoptional("Quantity is required"),
    purchasePrice: z
        .number()
        .nonnegative("Purchase price should be positive")
        .optional(), // Optional for updates - only required when updating pricing
    purchaseQuantity: z
        .number()
        .nonnegative("Purchase quantity should be positive")
        .optional(), // Optional - only sent when updating pricing
    minStockLevel: z
        .number()
        .nonnegative("Minimum stock level should be positive"),
    lastPurchaseDate: z.string().nonempty("Purchase date is required"),
    supplierName: z.string().optional(),
    notes: z.string().optional(),
});

export type UpdateMaterialsInput = z.infer<typeof updateMaterialsValidation>;
export type AddMaterialsInput = z.infer<typeof addMaterialsValidation>;
