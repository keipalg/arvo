import { z } from "zod";
import {
    addStudioOverheadExpense,
    deleteStudioOverheadExpense,
    getStudioOverheadExpenseList,
    updateStudioOverheadExpense,
    type StudioOverheadInsert,
} from "../service/studioOverheadExpenseService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { studioOverheadExpenseValidation } from "@arvo/shared";

const updateSchema = studioOverheadExpenseValidation.partial().extend({
    id: z.string(),
});

export const studioOverheadExpenseRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getStudioOverheadExpenseList(ctx.user.id);
    }),
    add: protectedProcedure
        .input(studioOverheadExpenseValidation)
        .mutation(async ({ ctx, input }) => {
            const updatedInputData: StudioOverheadInsert = {
                id: "",
                user_id: ctx.user.id,
                name: input.name,
                createdAt: new Date(),
                payment_method: input.payment_method,
                expense_type: input.expense_type,
                cost: input.cost.toString(),
                payee: input.payee,
                notes: input.notes,
                attach_recipt: input.attach_recipt,
            };

            try {
                await addStudioOverheadExpense(updatedInputData);
                return { success: true };
            } catch (err: any) {
                console.error(
                    "studioOverheadExpense.add failed. input:",
                    JSON.stringify(input),
                );
                console.error(
                    "studioOverheadExpense.add error:",
                    err?.message ?? err,
                );
                throw err;
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await deleteStudioOverheadExpense(input.id);
            return { success: true };
        }),

    update: protectedProcedure
        .input(updateSchema)
        .mutation(async ({ input }) => {
            const updates: Partial<StudioOverheadInsert> = {};

            if (input.name !== undefined) updates.name = input.name;
            if (input.payment_method !== undefined)
                updates.payment_method = input.payment_method;
            if (input.expense_type !== undefined)
                updates.expense_type = input.expense_type;
            if (input.cost !== undefined) updates.cost = String(input.cost); // normalize to string like add()
            if (input.payee !== undefined) updates.payee = input.payee;
            if (input.notes !== undefined) updates.notes = input.notes;
            if (input.attach_recipt !== undefined)
                updates.attach_recipt = input.attach_recipt;

            await updateStudioOverheadExpense(input.id, updates);
            return { success: true };
        }),
});
