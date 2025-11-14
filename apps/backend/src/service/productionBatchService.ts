import type {
    ProductionBatchInput,
    ProductionBatchUpdateInput,
} from "@arvo/shared";
import { and, between, eq, sql, type InferInsertModel } from "drizzle-orm";
import { getMonthRangeInTimezone } from "../utils/datetimeUtil.js";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import { good, productionBatch } from "../db/schema.js";
import {
    addGoodQuantity,
    getMaterialOutputRatioByGoodId,
    reduceGoodQuantity,
} from "./goodsService.js";
import {
    addMaterialQuantity,
    reduceMaterialQuantity,
} from "./materialsService.js";

const isDate = (value: any): value is Date => value instanceof Date;

export const getProductionBatch = async (userId: string) => {
    return await db
        .select({
            id: productionBatch.id,
            goodId: productionBatch.goodId,
            goodName: good.name,
            productionDate: productionBatch.productionDate,
            quantity: productionBatch.quantity,
            productionCost: productionBatch.productionCost,
            createdAt: productionBatch.createdAt,
            notes: productionBatch.notes,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .where(eq(good.userId, userId));
};

export const getProductionBatchById = async (
    userId: string,
    productionBatchId: string,
) => {
    return await db
        .select({
            id: productionBatch.id,
            goodId: productionBatch.goodId,
            goodName: good.name,
            productionDate: productionBatch.productionDate,
            quantity: productionBatch.quantity,
            productionCost: productionBatch.productionCost,
            notes: productionBatch.notes,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .where(
            and(
                eq(good.userId, userId),
                eq(productionBatch.id, productionBatchId),
            ),
        );
};

export type ProductionBatchInsert = InferInsertModel<typeof productionBatch>;
export const addProductionBatch = async (data: ProductionBatchInsert) => {
    return await db
        .insert(productionBatch)
        .values({
            id: uuidv7(),
            goodId: data.goodId,
            productionDate: data.productionDate,
            quantity: data.quantity,
            productionCost: data.productionCost,
            notes: data.notes,
        })
        .returning({ id: productionBatch.id });
};

export const processProductionBatch = async (
    input: ProductionBatchInput,
    userId: string,
) => {
    return await db.transaction(async (tx) => {
        const productionBatchData = await addProductionBatch({
            id: "",
            goodId: input.goodId,
            productionDate:
                input.productionDate || new Date().toISOString().split("T")[0],
            quantity: input.quantity,
            productionCost: input.productionCost,
            notes: input.notes,
        });

        for (const material of input.materials) {
            // Reduce material quantity
            await reduceMaterialQuantity(
                material.materialId,
                userId,
                material.amount,
                tx,
            );
        }

        await addGoodQuantity(input.goodId, userId, input.quantity);

        return { success: true, batchId: productionBatchData[0].id };
    });
};

export const updateProductionBatch = async (
    id: string,
    data: ProductionBatchUpdateInput,
) => {
    return await db
        .update(productionBatch)
        .set({
            ...data,
            productionDate: isDate(data.productionDate)
                ? data.productionDate.toISOString().split("T")[0]
                : data.productionDate,
        })
        .where(and(eq(productionBatch.id, id)))
        .returning({ id: productionBatch.id });
};

export const processProductionBatchUpdate = async (
    userId: string,
    data: ProductionBatchUpdateInput,
) => {
    const lastProductionBatch = await getProductionBatchById(userId, data.id);

    // Calculate difference of quantity
    const quantityDiff =
        data.quantity - (lastProductionBatch[0]?.quantity || 0);

    for (const material of data.materials) {
        const amountDiff =
            (lastProductionBatch[0]?.quantity || 0) *
                (material.amount / data.quantity) -
            material.amount;

        if (amountDiff > 0) {
            await addMaterialQuantity(material.materialId, userId, amountDiff);
        } else if (amountDiff < 0) {
            await reduceMaterialQuantity(
                material.materialId,
                userId,
                Math.abs(amountDiff),
            );
        }
    }
    if (quantityDiff > 0) {
        await addGoodQuantity(data.goodId, userId, quantityDiff);
    } else if (quantityDiff < 0) {
        await reduceGoodQuantity(data.goodId, userId, Math.abs(quantityDiff));
    }
    await updateProductionBatch(data.id, data);
};

export const deleteProductionBatch = async (
    productionBatchId: string,
    userId: string,
) => {
    const productionBatchData = await getProductionBatchById(
        userId,
        productionBatchId,
    );

    const materialOutputRatios = await getMaterialOutputRatioByGoodId(
        userId,
        productionBatchData[0].goodId,
    );

    if (productionBatchData[0].quantity) {
        await reduceGoodQuantity(
            productionBatchData[0].goodId,
            userId,
            productionBatchData[0].quantity,
        );
        for (let ratio of materialOutputRatios) {
            let amount = ratio.input * productionBatchData[0].quantity;
            await addMaterialQuantity(ratio.materialId, userId, amount);
        }
    }

    await db
        .delete(productionBatch)
        .where(eq(productionBatch.id, productionBatchId));
};

const getProducedItemByMonth = async (
    userId: string,
    timezone: string,
    order: "ASC" | "DESC" = "DESC",
    limit: number = 1,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, 0);

    const orderSql =
        order === "DESC"
            ? sql`cast(sum(${productionBatch.quantity}) as int) DESC`
            : sql`cast(sum(${productionBatch.quantity}) as int) ASC`;

    const results = await db
        .select({
            goodName: good.name,
            goodId: good.id,
            totalQuantity: sql<number>`cast(sum(${productionBatch.quantity}) as int)`,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .where(
            and(
                eq(good.userId, userId),
                between(
                    productionBatch.productionDate,
                    targetMonth.start.toISOString().split("T")[0],
                    targetMonth.end.toISOString().split("T")[0],
                ),
            ),
        )
        .groupBy(good.name, good.id)
        .orderBy(orderSql)
        .limit(limit);
    return results;
};

export const getMostProducedProductWithComparison = async (
    userId: string,
    timezone: string,
) => {
    const currentMonth = await getProducedItemByMonth(
        userId,
        timezone,
        "DESC",
        1,
    );

    if (currentMonth.length === 0) {
        return {
            productName: "No Production",
            currentProduction: 0,
            percentageChange: 0,
        };
    }

    const topProduct = currentMonth[0];
    const lastMonth = getMonthRangeInTimezone(timezone, -1);

    const lastMonthProduction = await db
        .select({
            goodsProduced: sql<number>`cast(sum(${productionBatch.quantity}) as int)`,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .where(
            and(
                eq(good.userId, userId),
                eq(good.id, topProduct.goodId),
                between(
                    productionBatch.productionDate,
                    lastMonth.start.toISOString().split("T")[0],
                    lastMonth.end.toISOString().split("T")[0],
                ),
            ),
        );

    const lastMonthQuantity = lastMonthProduction[0]?.goodsProduced ?? 0;
    const percentageChange =
        lastMonthQuantity === 0
            ? 100
            : ((topProduct.totalQuantity - lastMonthQuantity) /
                  lastMonthQuantity) *
              100;

    return {
        productName: topProduct.goodName,
        currentProduction: topProduct.totalQuantity,
        percentageChange: Math.round(percentageChange * 100) / 100,
    };
};

export const getLeastProducedProductWithComparison = async (
    userId: string,
    timezone: string,
) => {
    const currentMonth = await getProducedItemByMonth(
        userId,
        timezone,
        "ASC",
        1,
    );

    if (currentMonth.length === 0) {
        return {
            productName: "No Production",
            currentProduction: 0,
            percentageChange: 0,
        };
    }

    const leastProduct = currentMonth[0];
    const lastMonth = getMonthRangeInTimezone(timezone, -1);

    const lastMonthProduction = await db
        .select({
            goodsProduced: sql<number>`cast(sum(${productionBatch.quantity}) as int)`,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .where(
            and(
                eq(good.userId, userId),
                eq(good.id, leastProduct.goodId),
                between(
                    productionBatch.productionDate,
                    lastMonth.start.toISOString().split("T")[0],
                    lastMonth.end.toISOString().split("T")[0],
                ),
            ),
        );

    const lastMonthQuantity = lastMonthProduction[0]?.goodsProduced ?? 0;
    const percentageChange =
        lastMonthQuantity === 0
            ? 100
            : ((leastProduct.totalQuantity - lastMonthQuantity) /
                  lastMonthQuantity) *
              100;

    return {
        productName: leastProduct.goodName,
        currentProduction: leastProduct.totalQuantity,
        percentageChange: Math.round(percentageChange * 100) / 100,
    };
};
