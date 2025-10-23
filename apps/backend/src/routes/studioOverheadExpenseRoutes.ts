import {
    addStudioOverheadExpense,
    getStudioOverheadExpenseList,
    type StudioOverheadInsert,
} from "../service/studioOverheadExpenseService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { studioOverheadExpenseValidation } from "shared/validation/studioOverheadExpenseValidation.js";

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
});
