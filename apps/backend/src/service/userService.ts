import { eq, type InferInsertModel } from "drizzle-orm";
import { user } from "../auth/auth-schema.js";
import { db } from "../db/client.js";

type UserInfo = Partial<InferInsertModel<typeof user>>;

export const getUserInfo = async (userId: string) => {
    return await db.select().from(user).where(eq(user.id, userId)).limit(1);
};

export const updateUserInfo = async (userId: string, data: UserInfo) => {
    await db.update(user).set(data).where(eq(user.id, userId));
    const updatedUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
    return updatedUser[0];
};
