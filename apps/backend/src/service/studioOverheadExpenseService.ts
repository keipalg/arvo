import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { studio_overhead_expense } from "../db/schema.js";

export const getStudioOverheadExpenseList = async (user_id: string) => {
    return await db
        .select()
        .from(studio_overhead_expense)
        .where(eq(studio_overhead_expense.user_id, user_id));
};
