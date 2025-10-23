import { sql, eq, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    good,
    productType,
    collectionTag,
    goodToCollectionTag,
    unit,
    materialAndSupply,
    materialOutputRatio,
    goodToMaterialOutputRatio,
    userPreference,
    userToUserPreference,
} from "../db/schema.js";

export const getGoodsList = async (userId: string) => {
    const goods = await db
        .select({
            id: good.id,
            name: good.name,
            type: productType.name,
            image: good.image,
            retailPrice: good.retailPrice,
            note: good.note,
            inventoryQuantity: good.inventoryQuantity,
            producedQuantity: good.producedQuantity,
            collectionTag: collectionTag.name,
        })
        .from(good)
        .where(eq(good.userId, userId))
        .leftJoin(productType, eq(productType.id, good.productTypeId))
        .leftJoin(goodToCollectionTag, eq(goodToCollectionTag.goodId, good.id))
        .leftJoin(
            collectionTag,
            eq(collectionTag.id, goodToCollectionTag.collectionTagId),
        );

    return goods;
};

export const getMaterialsList = async (userId: string) => {
    return await db.query.materialAndSupply.findMany({
        columns: {
            id: true,
            name: true,
            unitId: true,
            costPerUnit: true,
        },
        where: eq(materialAndSupply.userId, userId),
        with: {
            unit: {
                columns: {
                    abbreviation: true,
                },
            },
        },
    });
};

export const getProductTypesList = async (userId: string) => {
    return await db
        .select({
            id: productType.id,
            name: productType.name,
        })
        .from(productType)
        .innerJoin(
            userPreference,
            sql`${productType.id} = ANY(${userPreference.productTypeIds} )`,
        )
        .where(eq(userPreference.userId, userId));
};

export const getUserPreference = async (userId: string) => {
    return await db.query.userPreference.findMany({
        columns: {
            profitPercentage: true,
            operatingCostPercentage: true,
            laborCost: true,
            overheadCostPercentage: true,
        },
        where: eq(userPreference.userId, userId),
    });
};

export type GoodInsert = InferInsertModel<typeof good>;
export const addGood = async (data: GoodInsert) => {
    return await db
        .insert(good)
        .values({
            id: crypto.randomUUID(),
            userId: data.userId,
            name: data.name,
            productTypeId: data.productTypeId,
            retailPrice: data.retailPrice,
            image: data.image,
            note: data.note,
            inventoryQuantity: data.inventoryQuantity,
            minimumStockLevel: data.minimumStockLevel,
            materialCost: data.materialCost,
            laborCost: data.laborCost,
            overheadCost: data.overheadCost,
            operatingCost: data.operatingCost,
            netProfit: data.netProfit,
        })
        .returning({ id: good.id });
};

export type MaterialOutputRatioInsert = InferInsertModel<
    typeof materialOutputRatio
>;
export const addMaterialOutputRatio = async (
    data: MaterialOutputRatioInsert,
) => {
    return await db
        .insert(materialOutputRatio)
        .values({
            id: crypto.randomUUID(),
            materialId: data.materialId,
            input: data.input,
        })
        .returning({ id: materialOutputRatio.id });
};

export type goodToMaterialOutputRatioInsert = InferInsertModel<
    typeof goodToMaterialOutputRatio
>;
export const addGoodToMaterialOutputRatio = async (
    data: goodToMaterialOutputRatioInsert,
) => {
    return await db.insert(goodToMaterialOutputRatio).values({
        goodId: data.goodId,
        materialOutputRatioId: data.materialOutputRatioId,
    });
};

export const deleteGood = async (goodId: string) => {
    await db.delete(good).where(eq(good.id, goodId));
};
