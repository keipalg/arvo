import { and, asc, eq, inArray, type InferInsertModel } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import {
    collectionTag,
    good,
    goodToCollectionTag,
    goodToMaterialOutputRatio,
    materialAndSupply,
    materialOutputRatio,
    productType,
    userPreference,
    unit,
} from "../db/schema.js";

export const getGoodsList = async (userId: string) => {
    const goods = await db
        .select({
            id: good.id,
            name: good.name,
            type: productType.name,
            typeId: good.productTypeId,
            image: good.image,
            retailPrice: good.retailPrice,
            note: good.note,
            inventoryQuantity: good.inventoryQuantity,
            producedQuantity: good.producedQuantity,
            collectionTag: collectionTag.name,
            materialCost: good.materialCost,
            minimumStockLevel: good.minimumStockLevel,
            createdAt: good.createdAt,
        })
        .from(good)
        .orderBy(asc(good.createdAt))
        .where(eq(good.userId, userId))
        .leftJoin(productType, eq(productType.id, good.productTypeId))
        .leftJoin(goodToCollectionTag, eq(goodToCollectionTag.goodId, good.id))
        .leftJoin(
            collectionTag,
            eq(collectionTag.id, goodToCollectionTag.collectionTagId),
        );

    return goods;
};

export const getMaterialOutputRatio = async (userId: string) => {
    const materialOutputRatioData = await db
        .select({
            id: good.id,
            name: good.name,
            materialId: materialOutputRatio.materialId,
            materialName: materialAndSupply.name,
            input: materialOutputRatio.input,
            abbreviation: unit.abbreviation,
            costPerUnit: materialAndSupply.costPerUnit,
        })
        .from(materialOutputRatio)
        .leftJoin(
            goodToMaterialOutputRatio,
            eq(
                goodToMaterialOutputRatio.materialOutputRatioId,
                materialOutputRatio.id,
            ),
        )
        .leftJoin(good, eq(goodToMaterialOutputRatio.goodId, good.id))
        .leftJoin(
            materialAndSupply,
            eq(materialOutputRatio.materialId, materialAndSupply.id),
        )
        .leftJoin(unit, eq(unit.id, materialAndSupply.unitId))
        .where(eq(good.userId, userId));

    return materialOutputRatioData;
};

export const getMaterialOutputRatioByGoodId = async (
    userId: string,
    goodId: string,
) => {
    const materialOutputRatioData = await db
        .select({
            id: good.id,
            materialOutputRatioId: materialOutputRatio.id,
            name: good.name,
            materialId: materialOutputRatio.materialId,
            materialName: materialAndSupply.name,
            input: materialOutputRatio.input,
            abbreviation: unit.abbreviation,
            costPerUnit: materialAndSupply.costPerUnit,
        })
        .from(materialOutputRatio)
        .leftJoin(
            goodToMaterialOutputRatio,
            eq(
                goodToMaterialOutputRatio.materialOutputRatioId,
                materialOutputRatio.id,
            ),
        )
        .leftJoin(good, eq(goodToMaterialOutputRatio.goodId, good.id))
        .leftJoin(
            materialAndSupply,
            eq(materialOutputRatio.materialId, materialAndSupply.id),
        )
        .leftJoin(unit, eq(unit.id, materialAndSupply.unitId))
        .where(and(eq(good.userId, userId), eq(good.id, goodId)));

    return materialOutputRatioData;
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
        .where(eq(productType.userId, userId));
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

export const getGoodToMaterialOutputRatio = async (goodId: string) => {
    return await db.query.goodToMaterialOutputRatio.findMany({
        columns: {
            goodId: true,
            materialOutputRatioId: true,
        },
        where: eq(goodToMaterialOutputRatio.goodId, goodId),
    });
};

export type GoodInsert = InferInsertModel<typeof good>;
export const addGood = async (data: GoodInsert) => {
    return await db
        .insert(good)
        .values({
            id: uuidv7(),
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
            id: uuidv7(),
            materialId: data.materialId,
            input: data.input,
        })
        .returning({ id: materialOutputRatio.id });
};

export type GoodToMaterialOutputRatioInsert = InferInsertModel<
    typeof goodToMaterialOutputRatio
>;
export const addGoodToMaterialOutputRatio = async (
    data: GoodToMaterialOutputRatioInsert,
) => {
    return await db.insert(goodToMaterialOutputRatio).values({
        goodId: data.goodId,
        materialOutputRatioId: data.materialOutputRatioId,
    });
};

export type GoodUpdate = Partial<Omit<GoodInsert, "createdAt" | "updatedAt">>;

export const updateGood = async (
    goodId: string,
    userId: string,
    data: GoodUpdate,
) => {
    return await db
        .update(good)
        .set(data)
        .where(and(eq(good.id, goodId), eq(good.userId, userId)))
        .returning({ id: good.id });
};

export type MaterialOutputRatioUpdate = Partial<
    Omit<MaterialOutputRatioInsert, "id" | "createdAt" | "updatedAt">
>;

export const updateMaterialOutputRatio = async (
    id: string,
    data: MaterialOutputRatioUpdate,
) => {
    return await db
        .update(materialOutputRatio)
        .set(data)
        .where(and(eq(materialOutputRatio.id, id)))
        .returning({ id: materialOutputRatio.id });
};

export const deleteGood = async (goodId: string) => {
    await db.delete(good).where(eq(good.id, goodId));
};

export const deleteMaterialOutputRatio = async (
    materialOutputRatioId: string,
) => {
    await db
        .delete(goodToMaterialOutputRatio)
        .where(
            eq(
                goodToMaterialOutputRatio.materialOutputRatioId,
                materialOutputRatioId,
            ),
        );
    await db
        .delete(materialOutputRatio)
        .where(eq(materialOutputRatio.id, materialOutputRatioId));
};

export const getProductsListForSales = async (userId: string) => {
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

export const getGoodInfoByIds = async (userId: string, goodIds: string[]) => {
    return await db
        .select({
            id: good.id,
            name: good.name,
            retailPrice: good.retailPrice,
            materialCost: good.materialCost,
            laborCost: good.laborCost,
            overheadCost: good.overheadCost,
            netProfit: good.netProfit,
            inventoryQuantity: good.inventoryQuantity,
        })
        .from(good)
        .where(and(eq(good.userId, userId), inArray(good.id, goodIds)));
};

export const addGoodQuantity = async (
    goodId: string,
    userId: string,
    quantityToAdd: number,
) => {
    // Get first match
    const [goodRecord] = await db
        .select()
        .from(good)
        .where(and(eq(good.id, goodId), eq(good.userId, userId)))
        .limit(1);

    if (!goodRecord) {
        throw new Error("Good not found");
    }

    const newQuantity = (goodRecord.inventoryQuantity ?? 0) + quantityToAdd;

    return await db
        .update(good)
        .set({ inventoryQuantity: newQuantity })
        .where(and(eq(good.id, goodId), eq(good.userId, userId)))
        .returning({
            id: good.id,
            inventoryQuantity: good.inventoryQuantity,
        });
};

export const reduceGoodQuantity = async (
    goodId: string,
    userId: string,
    quantityToDeduct: number,
) => {
    // Get first match
    const [goodRecord] = await db
        .select()
        .from(good)
        .where(and(eq(good.id, goodId), eq(good.userId, userId)))
        .limit(1);

    if (!goodRecord) {
        throw new Error("Good not found");
    }
    if (goodRecord.inventoryQuantity < quantityToDeduct) {
        throw new Error(
            `Insufficient quantity. Available: ${goodRecord.inventoryQuantity}, Requested: ${quantityToDeduct}`,
        );
    }

    const newQuantity = (goodRecord.inventoryQuantity ?? 0) - quantityToDeduct;

    return await db
        .update(good)
        .set({ inventoryQuantity: newQuantity })
        .where(and(eq(good.id, goodId), eq(good.userId, userId)))
        .returning({
            id: good.id,
            inventoryQuantity: good.inventoryQuantity,
        });
};
