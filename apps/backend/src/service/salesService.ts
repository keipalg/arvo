import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { channel, sale, status } from "../db/schema.js";

export const getSalesList = async (userId: string) => {
    return await db
        .select({
            id: sale.id,
            salesNumber: sale.salesNumber,
            customer: sale.customer,
            totalPrice: sale.totalPrice,
            date: sale.date,
            channel: channel.name,
            status: status.key,
        })
        .from(sale)
        .where(eq(sale.userId, userId))
        .innerJoin(channel, eq(sale.channelId, channel.id))
        .innerJoin(status, eq(sale.statusId, status.id));
};
