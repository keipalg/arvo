import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { operational_expense } from "../db/schema.js";

export const getOperationalExpenseList = async (user_id: string) => {
    return await db
        .select()
        .from(operational_expense)
        .where(eq(operational_expense.user_id, user_id));
};
