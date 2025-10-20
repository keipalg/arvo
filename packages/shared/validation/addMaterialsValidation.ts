import { z } from "zod";

export const addMaterialsValidation = z.object({
    name: z.string().nonempty("Item name is required"),
    type: z.string().nonempty("Type is required"),
    unit: z.string().nonempty("Unit is required"),
    quantity: z
        .number()
        .nonnegative("Quantity should be positive")
        .nonoptional("Quantity is required"),
    cost: z
        .number()
        .nonnegative("Cost should be positive")
        .nonoptional("Cost is reqruired"),
    minStockLevel: z
        .number()
        .nonnegative("Minimum stock level should be positive"),
    lastPurchaseDate: z.string().nonempty("Purchase date is required"),
    supplierName: z.string().optional(),
    notes: z.string().optional(),
});

export type AddMaterialsInput = z.infer<typeof addMaterialsValidation>;
