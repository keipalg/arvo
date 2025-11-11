import {
    and,
    between,
    eq,
    max,
    sql,
    type InferInsertModel,
    type InferSelectModel,
} from "drizzle-orm";
import { channel, good, sale, saleDetail, status } from "../db/schema.js";
import { v7 as uuidv7 } from "uuid";
import { db, type NeonDbTx } from "../db/client.js";
import { getMonthRangeInTimezone } from "../utils/datetimeUtil.js";
import { createProductLowInventoryNotification } from "./notificationsService.js";

export type GoodSelect = Partial<InferSelectModel<typeof good>>;
export type SaleSelect = InferSelectModel<typeof sale>;
export const getSalesList = async (userId: string) => {
    return await db
        .select({
            id: sale.id,
            salesNumber: sale.salesNumber,
            customer: sale.customer,
            totalPrice: sale.totalPrice,
            date: sale.date,
            channelId: channel.id,
            channel: channel.name,
            status: status.key,
            note: sale.note,
            discount: sale.discount,
            shippingFee: sale.shippingFee,
            taxPercentage: sale.taxPercentage,
        })
        .from(sale)
        .where(eq(sale.userId, userId))
        .innerJoin(channel, eq(sale.channelId, channel.id))
        .innerJoin(status, eq(sale.statusId, status.id));
};

export const getSaleDetailsBySaleId = async (
    saleId: string,
    tx: NeonDbTx = db,
) => {
    return await tx
        .select({
            id: saleDetail.id,
            goodId: saleDetail.goodId,
            quantity: saleDetail.quantity,
            pricePerItem: saleDetail.pricePerItem,
        })
        .from(saleDetail)
        .where(eq(saleDetail.saleId, saleId));
};

export type SaleInsert = InferInsertModel<typeof sale>;
export const addSale = async (data: SaleInsert, tx: NeonDbTx = db) => {
    return await tx
        .insert(sale)
        .values({
            id: uuidv7(),
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
            cogs: data.cogs,
            profit: data.profit,
        })
        .returning({ id: sale.id });
};

export type SaleDetailInsert = InferInsertModel<typeof saleDetail>;
export const addSaleDetail = async (
    data: SaleDetailInsert,
    tx: NeonDbTx = db,
) => {
    await tx.insert(saleDetail).values({
        id: uuidv7(),
        saleId: data.saleId,
        goodId: data.goodId,
        quantity: data.quantity,
        pricePerItem: data.pricePerItem,
        cogs: data.cogs,
    });
};

export const updateSale = async (data: SaleInsert, tx: NeonDbTx = db) => {
    await tx
        .update(sale)
        .set({
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
            cogs: data.cogs,
            profit: data.profit,
        })
        .where(eq(sale.id, data.id));
};

export const updateSaleDetail = async (
    data: SaleDetailInsert,
    tx: NeonDbTx = db,
) => {
    await tx
        .update(saleDetail)
        .set({
            goodId: data.goodId,
            quantity: data.quantity,
            pricePerItem: data.pricePerItem,
        })
        .where(eq(saleDetail.id, data.id));
};

export const updateInventoryQuantity = async (
    goodId: string,
    quantity: number,
    tx: NeonDbTx = db,
) => {
    const result = await tx
        .update(good)
        .set({
            inventoryQuantity: sql`${good.inventoryQuantity} + ${quantity}`,
        })
        .where(eq(good.id, goodId))
        .returning({
            id: good.id,
            name: good.name,
            userId: good.userId,
            minimumStockLevel: good.minimumStockLevel,
            inventoryQuantity: good.inventoryQuantity,
        });

    await _checkAndNotifyLowInventory(result[0]);
};

export const deleteSale = async (saleId: string, tx: NeonDbTx = db) => {
    await tx.delete(sale).where(eq(sale.id, saleId));
};

export const deleteSaleDetailsBySaleId = async (
    saleId: string,
    tx: NeonDbTx = db,
) => {
    await tx.delete(saleDetail).where(eq(saleDetail.saleId, saleId));
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

export const getMonthlySalesRevenue = async (
    userId: string,
    timezone: string,
    offset: number = 0,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, offset);
    const result = await db
        .select({
            totalRevenue: sql<number>`cast(sum(${sale.totalPrice}) as int)`,
            totalProfit: sql<number>`cast(sum(${sale.profit}) as int)`,
        })
        .from(sale)
        .where(
            and(
                eq(sale.userId, userId),
                between(sale.date, targetMonth.start, targetMonth.end),
            ),
        );
    return result[0] ?? { totalRevenue: 0, totalProfit: 0 };
};

export const getMonthlySalesCount = async (
    userId: string,
    timezone: string,
    offset: number = 0,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, offset);
    const summary = await db
        .select({
            count: sql<number>`cast(count(${sale.id}) as int)`,
        })
        .from(sale)
        .where(
            and(
                eq(sale.userId, userId),
                between(sale.date, targetMonth.start, targetMonth.end),
            ),
        );
    return summary[0].count ?? 0;
};

// Check the sales is used or not
export const getSalesCount = async (goodId: string, userId: string) => {
    const result = await db
        .select({
            count: sql<number>`cast(count(${saleDetail.id}) as int)`,
        })
        .from(saleDetail)
        .innerJoin(sale, eq(saleDetail.saleId, sale.id))
        .where(and(eq(saleDetail.goodId, goodId), eq(sale.userId, userId)));

    return result[0].count ?? 0;
};

const _checkAndNotifyLowInventory = async (product: GoodSelect) => {
    const remainingQuantity = Number(product.inventoryQuantity ?? 0);
    const threshold = Number(product.minimumStockLevel ?? 0);

    if (remainingQuantity < Number(threshold)) {
        await createProductLowInventoryNotification(
            product.userId!,
            product.name!,
            remainingQuantity,
        );
    }
};
