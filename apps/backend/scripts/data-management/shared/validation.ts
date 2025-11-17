import { eq } from "drizzle-orm";
import { db } from "../../../src/db/client.js";
import { user } from "../../../src/auth/auth-schema.js";

/**
 * Validate user exists in database
 */
export async function validateUserExists(userId: string): Promise<boolean> {
    const result = await db
        .select({ id: user.id, email: user.email })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

    if (result.length === 0) {
        throw new Error(`User not found: ${userId}`);
    }

    console.log(`✓ User found: ${result[0].email}`);
    return true;
}

/**
 * Validate month format (YYYY-MM)
 */
export function validateMonthFormat(month: string): boolean {
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regex.test(month)) {
        throw new Error(
            `Invalid month format: ${month}. Expected format: YYYY-MM (e.g., "2025-06")`,
        );
    }
    return true;
}

/**
 * Check if month is in the past
 */
export function isMonthInPast(month: string): boolean {
    const [year, monthNum] = month.split("-").map(Number);
    const targetDate = new Date(year, monthNum - 1, 1);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return targetDate < currentMonthStart;
}

/**
 * Validate month format and optionally check if it's in the past
 */
export function validateMonth(
    month: string,
    mustBeInPast: boolean = false,
): void {
    validateMonthFormat(month);

    if (mustBeInPast && !isMonthInPast(month)) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        throw new Error(
            `Target month must be in the past\n  Provided: ${month}\n  Current month: ${currentMonth}`,
        );
    }
}
