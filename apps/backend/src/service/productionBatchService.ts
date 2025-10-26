import { eq, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    good,
    productionBatch,
    batchRecipe,
    productionBatchToBatchRecipe,
    productionStatus,
} from "../db/schema.js";
import { v7 as uuidv7 } from "uuid";

export const getProductionBatch = async (userId: string) => {
    return await db
        .select({
            id: productionBatch.id,
            goodId: productionBatch.goodId,
            productionDate: productionBatch.productionDate,
            quantity: productionBatch.quantity,
            productionCost: productionBatch.productionCost,
            status: productionStatus.key,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .innerJoin(
            productionStatus,
            eq(productionStatus.id, productionBatch.statusId),
        )
        .where(eq(good.userId, userId));
};

export type ProductionBatchInsert = InferInsertModel<typeof productionBatch>;
export const addProductionBatch = async (data: ProductionBatchInsert) => {
    return await db
        .insert(productionBatch)
        .values({
            id: crypto.randomUUID(),
            goodId: data.goodId,
            productionDate: data.productionDate,
            quantity: data.quantity,
            productionCost: data.productionCost,
            statusId: data.statusId,
        })
        .returning({ id: productionBatch.id });
};

export type ProductionBatchToBatchRecipeInsert = InferInsertModel<
    typeof productionBatchToBatchRecipe
>;
export const addProductionBatchToBatchRecipe = async (
    data: ProductionBatchToBatchRecipeInsert,
) => {
    return await db.insert(productionBatchToBatchRecipe).values({
        productionBatchId: data.productionBatchId,
        batchRecipeId: data.batchRecipeId,
    });
};

export const getProductionStatusList = async () => {
    return await db
        .select({ key: productionStatus.key, name: productionStatus.name })
        .from(productionStatus);
};

export type BatchRecipeInsert = InferInsertModel<typeof batchRecipe>;
export const addBatchRecipe = async (data: BatchRecipeInsert) => {
    return await db
        .insert(batchRecipe)
        .values({
            id: uuidv7(),
            materialId: data.materialId,
            usageAmount: data.usageAmount,
        })
        .returning({ id: batchRecipe.id });
};

export const getProductionStatusByKey = async (key: string) => {
    return await db.query.productionStatus.findFirst({
        where: eq(productionStatus.key, key),
    });
};
