import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { channel, sale, status } from "../db/schema.js";

export const getSalesList = async () => {
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
        .innerJoin(channel, eq(sale.channelId, channel.id))
        .innerJoin(status, eq(sale.statusId, status.id));
};
