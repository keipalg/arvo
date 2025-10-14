import { eq, max, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    channel,
    good,
    sale,
    saleDetail,
    sampleTable,
    status,
} from "../db/schema.js";

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

export const getProductsList = async (userId: string) => {
    return await db.query.good.findMany({
        columns: {
            id: true,
            name: true,
            retailPrice: true,
            inventoryQuantity: true,
        },
        where: eq(good.userId, userId),
    });
};

export type SaleInsert = InferInsertModel<typeof sale>;
export const addSale = async (data: SaleInsert) => {
    return await db
        .insert(sale)
        .values({
            id: crypto.randomUUID(),
            userId: data.userId,
            customer: data.customer,
            salesNumber: data.salesNumber,
            channelId: data.channelId,
            date: data.date,
            statusId: data.statusId,
            totalPrice: data.totalPrice,
            note: data.note,
            discount: data.discount,
            shippingFee: data.shippingFee,
            taxPercentage: data.taxPercentage,
            profit: data.profit,
        })
        .returning({ id: sale.id });
};

export type SaleDetailInsert = InferInsertModel<typeof saleDetail>;
export const addSaleDetail = async (data: SaleDetailInsert) => {
    await db.insert(saleDetail).values({
        id: crypto.randomUUID(),
        saleId: data.saleId,
        goodId: data.goodId,
        quantity: data.quantity,
        pricePerItem: data.pricePerItem,
    });
};

export const deleteSale = async (saleId: string) => {
    await db.delete(sale).where(eq(sale.id, saleId));
};

export const getMaxSalesNumber = async (userId: string) => {
    const result = await db
        .select({
            maxSalesNumber: max(sale.salesNumber),
        })
        .from(sale)
        .where(eq(sale.userId, userId))
        .limit(1);

    return result[0].maxSalesNumber ?? 0;
};
