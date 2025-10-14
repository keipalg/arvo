import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { status } from "../db/schema.js";

export const getStatusList = async () => {
    return await db.select({ key: status.key, name: status.name }).from(status);
};

export const getStatusByKey = async (key: string) => {
    return await db.query.status.findFirst({
        where: eq(status.key, key),
    });
};
