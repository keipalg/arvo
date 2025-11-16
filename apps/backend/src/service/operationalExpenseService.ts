import { eq, type InferInsertModel } from "drizzle-orm";
import { db, type NeonDbTx } from "../db/client.js";
import { operational_expense } from "../db/schema.js";
import { v7 as uuidv7 } from "uuid";

export const getOperationalExpenseList = async (user_id: string) => {
    return await db
        .select()
        .from(operational_expense)
        .where(eq(operational_expense.user_id, user_id));
};

export type OperationalInsert = InferInsertModel<typeof operational_expense>;
export const addOperationalExpense = async (
    data: OperationalInsert,
    tx: NeonDbTx = db,
) => {
    return await tx
        .insert(operational_expense)
        .values({
            id: uuidv7(),
            user_id: data.user_id,
            name: data.name,
            createdAt: data.createdAt,
            payment_method: data.payment_method,
            expense_type: data.expense_type,
            cost: data.cost,
            payee: data.payee,
            good_id: data.good_id,
            materialAndSupply_id: data.materialAndSupply_id,
            quantity: data.quantity,
            notes: data.notes,
            attach_recipt: data.attach_recipt,
            repeat_every: data.repeat_every,
            start_date: data.start_date,
            due_date: data.due_date,
        })
        .returning({
            id: operational_expense.id,
        });
};

export const deleteOperationalExpense = async (
    id: string,
    tx: NeonDbTx = db,
) => {
    return await tx
        .delete(operational_expense)
        .where(eq(operational_expense.id, id));
};

export const updateOperationalExpense = async (
    id: string,
    data: Partial<OperationalInsert>,
    tx: NeonDbTx = db,
) => {
    return await tx
        .update(operational_expense)
        .set(data)
        .where(eq(operational_expense.id, id))
        .returning({ id: operational_expense.id });
};

export const getOperationalExpenseById = async (
    id: string,
    tx: NeonDbTx = db,
) => {
    return await tx
        .select()
        .from(operational_expense)
        .where(eq(operational_expense.id, id));
};
