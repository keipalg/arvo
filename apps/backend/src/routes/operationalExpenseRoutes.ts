import {
    addOperationalExpense,
    getOperationalExpenseList,
    type OperationalInsert,
} from "../service/operationalExpenseService.js";
import { protectedProcedure, router } from "./trpcBase.js";
import { operationalExpenseValidation } from "shared/validation/operationalExpenseValidation.js";

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
                createdAt: new Date(),
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
});
