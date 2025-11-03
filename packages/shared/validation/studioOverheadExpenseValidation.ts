import { z } from "zod";

export const studioOverheadExpenseValidation = z.object({
    expense_type: z.enum([
        "miscellaneous",
        "tools_equipment",
        "packaging_supplies",
        "space_rent",
    ]),
    name: z.string(),
    cost: z.number().default(0),
    payee: z.string(),
    payment_method: z.enum(["credit", "cash"]),
    notes: z.string(),
    attach_recipt: z.string(),
    createdAt: z.date().default(() => new Date()),
    repeat_every: z
        .enum([
            "daily",
            "weekly",
            "bi-weekly",
            "monthly",
            "quarterly",
            "yearly",
        ])
        .nullable(),
    start_date: z.date().optional(),
    due_date: z.date().optional(),
});

export type studioOverheadExpenseValidationForm = z.infer<
    typeof studioOverheadExpenseValidation
>;
