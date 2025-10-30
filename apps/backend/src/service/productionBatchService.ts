import { and, eq, type InferInsertModel } from "drizzle-orm";
import type { ProductionBatchInput } from "@arvo/shared";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import { good, productionBatch, productionStatus } from "../db/schema.js";
import {
    addGoodQuantity,
    reduceGoodQuantity,
    getMaterialOutputRatioByGoodId,
} from "./goodsService.js";
import {
    reduceMaterialQuantity,
    addMaterialQuantity,
} from "./materialsService.js";

export const getProductionBatch = async (userId: string) => {
    return await db
        .select({
            id: productionBatch.id,
            goodId: productionBatch.goodId,
            goodName: good.name,
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
            status: productionStatus.key,
        })
        .from(good)
        .innerJoin(productionBatch, eq(productionBatch.goodId, good.id))
        .innerJoin(
            productionStatus,
            eq(productionStatus.id, productionBatch.statusId),
        )
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
            statusId: data.statusId,
        })
        .returning({ id: productionBatch.id });
};

export const getProductionStatusList = async () => {
    return await db
        .select({ key: productionStatus.key, name: productionStatus.name })
        .from(productionStatus);
};

export const getProductionStatusByKey = async (key: string) => {
    return await db.query.productionStatus.findFirst({
        where: eq(productionStatus.key, key),
    });
};

export const processProductionBatch = async (
    input: ProductionBatchInput,
    userId: string,
) => {
    return await db.transaction(async () => {
        const statusInfo = await getProductionStatusByKey(input.statusKey);
        const productionBatchData = await addProductionBatch({
            id: "",
            goodId: input.goodId,
            productionDate: input.productionDate
                ? new Date(input.productionDate)
                : new Date(),
            quantity: input.quantity,
            productionCost: input.productionCost,
            statusId: statusInfo?.id,
        });

        for (const material of input.materials) {
            // Reduce material quantity
            await reduceMaterialQuantity(
                material.materialId,
                userId,
                material.amount,
            );
        }

        await addGoodQuantity(input.goodId, userId, input.quantity);

        return { success: true, batchId: productionBatchData[0].id };
    });
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
