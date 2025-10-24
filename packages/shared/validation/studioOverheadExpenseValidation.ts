import { z } from "zod";

export const studioOverheadExpenseValidation = z.object({
    expense_type: z.enum([
        "miscellaneous",
        "tools_equipment",
        "packaging_supplies",
    ]),
    name: z.string(),
    cost: z.number().default(0),
    payee: z.string(),
    payment_method: z.enum(["credit", "cash"]),
    notes: z.string(),
    attach_recipt: z.string(),
    createdAt: z.date().default(() => new Date()),
});

export type studioOverheadExpenseValidationForm = z.infer<
    typeof studioOverheadExpenseValidation
>;
