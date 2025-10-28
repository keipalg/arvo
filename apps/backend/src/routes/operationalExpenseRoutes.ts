import { z } from "zod";
import {
    addOperationalExpense,
    deleteOperationalExpense,
    getOperationalExpenseById,
    getOperationalExpenseList,
    updateOperationalExpense,
    type OperationalInsert,
} from "../service/operationalExpenseService.js";
import { protectedProcedure, router, t } from "./trpcBase.js";
import { operationalExpenseValidation } from "shared/validation/operationalExpenseValidation.js";
import { updateInventoryQuantity } from "../service/salesService.js";
import { db } from "../db/client.js";
import {
    addMaterialQuantity,
    reduceMaterialQuantity,
} from "../service/materialsService.js";

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

            await db.transaction(async (tx) => {
                await addOperationalExpense(updatedInputData, tx);
                if (
                    updatedInputData.expense_type === "inventory_loss" &&
                    updatedInputData.good_id
                ) {
                    await updateInventoryQuantity(
                        updatedInputData.good_id,
                        -Number(updatedInputData.quantity),
                        tx,
                    );
                } else if (
                    updatedInputData.expense_type === "inventory_loss" &&
                    updatedInputData.materialAndSupply_id
                ) {
                    reduceMaterialQuantity(
                        updatedInputData.materialAndSupply_id,
                        ctx.user.id,
                        Number(updatedInputData.quantity),
                        tx,
                    );
                }
                return { success: true };
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await db.transaction(async (tx) => {
                const expenses = await getOperationalExpenseById(input.id, tx);
                await deleteOperationalExpense(input.id, tx);
                for (const expense of expenses) {
                    if (
                        expense.expense_type === "inventory_loss" &&
                        expense.good_id
                    ) {
                        await updateInventoryQuantity(
                            expense.good_id,
                            Number(expense.quantity),
                            tx,
                        );
                    } else if (
                        expense.expense_type === "inventory_loss" &&
                        expense.materialAndSupply_id
                    ) {
                        addMaterialQuantity(
                            expense.materialAndSupply_id,
                            expense.user_id,
                            Number(expense.quantity),
                            tx,
                        );
                    }
                }
            });

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
            if (input.cost !== undefined) updates.cost = String(input.cost);
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

            await db.transaction(async (tx) => {
                const currentExpenses = await getOperationalExpenseById(
                    input.id,
                    tx,
                );
                for (const currentExpense of currentExpenses) {
                    if (
                        /* Inventory -> Others */
                        currentExpense.expense_type === "inventory_loss" &&
                        updates.expense_type !== "inventory_loss"
                    ) {
                        if (currentExpense.good_id) {
                            await updateInventoryQuantity(
                                currentExpense.good_id,
                                Number(currentExpense.quantity),
                                tx,
                            );
                        } else if (currentExpense.materialAndSupply_id) {
                            await addMaterialQuantity(
                                currentExpense.materialAndSupply_id,
                                currentExpense.user_id,
                                Number(currentExpense.quantity),
                                tx,
                            );
                        }
                    } else if (
                        /* Others -> Inventory */
                        currentExpense.expense_type !== "inventory_loss" &&
                        updates.expense_type === "inventory_loss"
                    ) {
                        if (updates.good_id) {
                            await updateInventoryQuantity(
                                updates.good_id,
                                -Number(updates.quantity),
                                tx,
                            );
                        } else if (updates.materialAndSupply_id) {
                            await reduceMaterialQuantity(
                                updates.materialAndSupply_id,
                                currentExpense.user_id,
                                Number(updates.quantity),
                                tx,
                            );
                        }
                    } else if (
                        /* Inventory -> inventory update */
                        currentExpense.expense_type === "inventory_loss" &&
                        updates.expense_type === "inventory_loss"
                    ) {
                        const quantityDiff =
                            Number(updates.quantity) -
                            Number(currentExpense.quantity);
                        if (currentExpense.good_id) {
                            await updateInventoryQuantity(
                                currentExpense.good_id,
                                -quantityDiff,
                                tx,
                            );
                        } else if (currentExpense.materialAndSupply_id) {
                            if (quantityDiff > 0) {
                                await reduceMaterialQuantity(
                                    currentExpense.materialAndSupply_id,
                                    currentExpense.user_id,
                                    quantityDiff,
                                    tx,
                                );
                            } else if (quantityDiff < 0) {
                                await addMaterialQuantity(
                                    currentExpense.materialAndSupply_id,
                                    currentExpense.user_id,
                                    quantityDiff,
                                    tx,
                                );
                            }
                        }
                    }
                    await updateOperationalExpense(input.id, updates, tx);
                }
            });
            return { success: true };
        }),
});
