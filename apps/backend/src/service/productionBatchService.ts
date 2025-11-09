import { and, asc, eq, type InferInsertModel } from "drizzle-orm";
import type {
    ProductionBatchInput,
    ProductionBatchUpdateInput,
} from "@arvo/shared";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import { good, productionBatch } from "../db/schema.js";
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
            createdAt: productionBatch.createdAt,
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
            productionDate:
                data.productionDate instanceof Date
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
    const updatedProductionBatch = await updateProductionBatch(data.id, data);

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
