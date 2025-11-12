import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    good,
    goodToMaterialOutputRatio,
    materialAndSupply,
    materialOutputRatio,
    sale,
    saleDetail,
} from "../db/schema.js";

export const getUsedMaterialPerSales = async (userId: string) => {
    return await db
        .select({
            salesId: sale.id,
            soldDate: sale.date,
            salesNumber: sale.salesNumber,
            goodID: good.id,
            goodName: good.name,
            materialOutputRatioId:
                goodToMaterialOutputRatio.materialOutputRatioId,
            materialOutputRatio: materialOutputRatio.input,
            materialID: materialOutputRatio.materialId,
            materialName: materialAndSupply.name,
            costPerUnit: materialAndSupply.costPerUnit,
            usedMaterialCost: sql<number>`(${materialAndSupply.costPerUnit} * ${materialOutputRatio.input} * ${saleDetail.quantity})`,
        })
        .from(sale)
        .innerJoin(saleDetail, eq(saleDetail.saleId, sale.id))
        .innerJoin(good, eq(good.id, saleDetail.goodId))
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
        .where(and(eq(good.userId, userId)))
        .orderBy(desc(sale.date));
};
