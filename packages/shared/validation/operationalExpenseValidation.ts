import { z } from "zod";

export const operationalExpenseValidation = z
    .object({
        expense_type: z.enum([
            "marketing",
            "business_fee",
            "utilities",
            "office_supplies",
            "studio_rent",
            "labor",
            "storage_fee",
            "inventory_loss",
            "miscellaneous",
        ]),
        name: z.string(),
        cost: z.number().default(0),
        payee: z.string(),
        payment_method: z.enum(["credit", "cash"]),
        good_id: z.string().nullable(),
        materialAndSupply_id: z.string().nullable(),
        quantity: z.number().default(0),
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
        start_date: z.date().nullable(),
        due_date: z.date().nullable(),
    })
    .superRefine((data, ctx) => {
        if (data.expense_type === "inventory_loss") {
            if (!data.materialAndSupply_id && !data.good_id) {
                ctx.addIssue({
                    code: "custom",
                    message:
                        "Have to select either Material/Supply for inventory loss expense",
                    path: ["materialAndSupply_id"],
                });

                ctx.addIssue({
                    code: "custom",
                    message:
                        "Have to select either Good or Material/Supply for inventory loss expense",
                    path: ["good_id"],
                });
            }
        }
    });

export type operationalExpenseValidationForm = z.infer<
    typeof operationalExpenseValidation
>;
