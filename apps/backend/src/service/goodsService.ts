import { eq, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    good,
    productType,
    collectionTag,
    goodToCollectionTag,
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
        .innerJoin(productType, eq(productType.id, good.productTypeId))
        .leftJoin(goodToCollectionTag, eq(goodToCollectionTag.goodId, good.id))
        .leftJoin(
            collectionTag,
            eq(collectionTag.id, goodToCollectionTag.collectionTagId),
        );

    return goods;
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
            // TODO: Add minimum stock level
        })
        .returning({ id: good.id });
};
