import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    good,
    goodToMaterialOutputRatio,
    materialAndSupply,
    materialOutputRatio,
} from "../db/schema.js";

export const getGoodsRecipe = async (userId: string, goodIDs: string[]) => {
    const recipes = await Promise.all(
        goodIDs.map(async (goodID) => {
            const goodsRecipe = await db
                .select({
                    goodID: good.id,
                    goodName: good.name,
                    materialOutputRatioId:
                        goodToMaterialOutputRatio.materialOutputRatioId,
                    materialOutputRatio: materialOutputRatio.input,
                    materialID: materialOutputRatio.materialId,
                    materialName: materialAndSupply.name,
                    costPerUnit: materialAndSupply.costPerUnit,
                })
                .from(good)
                .innerJoin(
                    goodToMaterialOutputRatio,
                    eq(goodToMaterialOutputRatio.goodId, good.id),
                )
                .innerJoin(
                    materialOutputRatio,
                    eq(
                        materialOutputRatio.id,
                        goodToMaterialOutputRatio.materialOutputRatioId,
                    ),
                )
                .innerJoin(
                    materialAndSupply,
                    eq(materialAndSupply.id, materialOutputRatio.materialId),
                )
                .where(and(eq(good.userId, userId), eq(good.id, goodID)));

            return goodsRecipe;
        }),
    );

    console.log("recipes", recipes);
    return recipes.flat();
};
