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
            "event_fees",
        ]),
        name: z.string(),
        cost: z.number(),
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

            if (data.quantity <= 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Quantity must be at least 1",
                    path: ["quantity"],
                });
            }
        } else {
            if (!data.name || data.name.trim().length === 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Name is required",
                    path: ["name"],
                });
            }
            if (!data.payee || data.payee.trim().length === 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Payee is required",
                    path: ["payee"],
                });
            }
            if (!data.cost || data.cost <= 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Cost must be greater than 0",
                    path: ["cost"],
                });
            }
        }
    });

export type operationalExpenseValidationForm = z.infer<
    typeof operationalExpenseValidation
>;
