import { z } from "zod";
import {
    addOperationalExpense,
    deleteOperationalExpense,
    getOperationalExpenseList,
    updateOperationalExpense,
    type OperationalInsert,
} from "../service/operationalExpenseService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { operationalExpenseValidation } from "shared/validation/operationalExpenseValidation.js";

const updateSchema = operationalExpenseValidation.partial().extend({
    id: z.string(),
});

export const operationalExpenseRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getOperationalExpenseList(ctx.user.id);
    }),

    add: protectedProcedure
        .input(operationalExpenseValidation)
        .mutation(async ({ ctx, input }) => {
            const updatedInputData: OperationalInsert = {
                id: "",
                user_id: ctx.user.id,
                name: input.name,
                createdAt: input.createdAt,
                payment_method: input.payment_method,
                expense_type: input.expense_type,
                cost: input.cost.toString(),
                payee: input.payee,
                quantity: input.quantity.toString(),
                notes: input.notes,
                attach_recipt: input.attach_recipt,
                start_date: input.start_date,
                due_date: input.due_date,
                good_id: input.good_id === "" ? null : input.good_id,
                materialAndSupply_id:
                    input.materialAndSupply_id === ""
                        ? null
                        : input.materialAndSupply_id,
            };

            try {
                await addOperationalExpense(updatedInputData);
                return { success: true };
            } catch (err: any) {
                console.error(
                    "operationalExpense.add failed. input:",
                    JSON.stringify(input),
                );
                console.error(
                    "operationalExpense.add error:",
                    err?.message ?? err,
                );
                throw err;
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            try {
                await deleteOperationalExpense(input.id);
            } catch (err: any) {
                console.error(
                    "operationalExpense.delete failed. input:",
                    JSON.stringify(input),
                );
                console.error(
                    "operationalExpense.delete error:",
                    err?.message ?? err,
                );
                throw err;
            }
            return { success: true };
        }),

    update: protectedProcedure
        .input(updateSchema)
        .mutation(async ({ input }) => {
            const updates: Partial<OperationalInsert> = {};

            if (input.name !== undefined) updates.name = input.name;
            if (input.payment_method !== undefined)
                updates.payment_method = input.payment_method;
            if (input.expense_type !== undefined)
                updates.expense_type = input.expense_type;
            if (input.cost !== undefined) updates.cost = String(input.cost); // normalize to string like add()
            if (input.payee !== undefined) updates.payee = input.payee;
            if (input.quantity !== undefined)
                updates.quantity = String(input.quantity);
            if (input.notes !== undefined) updates.notes = input.notes;
            if (input.attach_recipt !== undefined)
                updates.attach_recipt = input.attach_recipt;
            if (input.start_date !== undefined)
                updates.start_date = input.start_date;
            if (input.due_date !== undefined) updates.due_date = input.due_date;
            if (input.good_id !== undefined)
                updates.good_id = input.good_id === "" ? null : input.good_id;
            if (input.materialAndSupply_id !== undefined)
                updates.materialAndSupply_id =
                    input.materialAndSupply_id === ""
                        ? null
                        : input.materialAndSupply_id;

            await updateOperationalExpense(input.id, updates);
            return { success: true };
        }),
});
