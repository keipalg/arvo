import { eq, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { studio_overhead_expense } from "../db/schema.js";
import { v7 as uuidv7 } from "uuid";

export const getStudioOverheadExpenseList = async (user_id: string) => {
    return await db
        .select()
        .from(studio_overhead_expense)
        .where(eq(studio_overhead_expense.user_id, user_id));
};

export type StudioOverheadInsert = InferInsertModel<
    typeof studio_overhead_expense
>;

export const addStudioOverheadExpense = async (data: StudioOverheadInsert) => {
    return await db.insert(studio_overhead_expense).values({
        id: uuidv7(),
        user_id: data.user_id,
        name: data.name,
        createdAt: data.createdAt,
        payment_method: data.payment_method,
        expense_type: data.expense_type,
        cost: data.cost,
        payee: data.payee,
        notes: data.notes,
        attach_recipt: data.attach_recipt,
    });
};

export const deleteStudioOverheadExpense = async (id: string) => {
    return await db
        .delete(studio_overhead_expense)
        .where(eq(studio_overhead_expense.id, id));
};

export const updateStudioOverheadExpense = async (
    id: string,
    data: Partial<StudioOverheadInsert>,
) => {
    return await db
        .update(studio_overhead_expense)
        .set(data)
        .where(eq(studio_overhead_expense.id, id));
};
