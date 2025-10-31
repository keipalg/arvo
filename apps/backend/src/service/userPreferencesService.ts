import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { userPreference } from "../db/schema.js";
import { v7 as uuidv7 } from "uuid";

/**
 * Create user preferences for new user
 * @param userId
 * @return created user preference
 */

export const createUserPreferences = async (userId: string) => {
    const [result] = await db
        .insert(userPreference)
        .values({
            id: uuidv7(),
            userId,
            productTypeIds: [],
            hasCompletedSetup: false,
        })
        .returning();
    return result;
};

/**
 * Get user preferences for user
 * @param userId user ID
 * @returns user preference
 */
export const getUserPreferences = async (userId: string) => {
    const [preference] = await db
        .select()
        .from(userPreference)
        .where(eq(userPreference.userId, userId));

    return preference;
};

export type UserPreferencesUpdate = Partial<
    Omit<
        InferInsertModel<typeof userPreference>,
        "id" | "userId" | "createdAt" | "updatedAt"
    >
>;
/**
 * Update user preferences
 * @param userId user ID
 * @param data partial user preference data
 */
export const updateUserPreferences = async (
    userId: string,
    data: UserPreferencesUpdate,
) => {
    await db
        .update(userPreference)
        .set(data)
        .where(eq(userPreference.userId, userId));
};
