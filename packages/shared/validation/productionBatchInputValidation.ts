import { z } from "zod";

export const productionBatchInputValidation = z.object({
    goodId: z.uuid("Please select a product"),
    quantity: z.number(),
    productionCost: z.number(),
    productionDate: z.string(),

    materials: z.array(
        z.object({
            materialId: z.uuid().nonempty("Material ID is required"),
            amount: z.number().min(0.01, "amount must be at least 1"),
        }),
    ),
    statusKey: z.string(),
});

export type ProductionBatchInput = z.infer<
    typeof productionBatchInputValidation
>;
