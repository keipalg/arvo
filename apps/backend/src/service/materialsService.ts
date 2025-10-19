import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { materialAndSupply, unit } from "../db/schema.js";
import {
    getQuantityWithUnit,
    getStatus,
    getTotalCost,
} from "../utils/materialsUtil.js";

export const getMaterialsList = async (userId: string) => {
    const materials = await db
        .select({
            id: materialAndSupply.id,
            name: materialAndSupply.name,
            type: materialAndSupply.materialType,
            unitName: unit.name,
            unitAbbreviation: unit.abbreviation,
            quantity: materialAndSupply.quantity,
            purchasePrice: materialAndSupply.purchasePrice,
            costPerUnit: materialAndSupply.costPerUnit,
            lastPurchaseDate: materialAndSupply.lastPurchaseDate,
            supplier: materialAndSupply.supplier,
            notes: materialAndSupply.notes,
            threshold: materialAndSupply.threshold,
            lastUpdatedDate: materialAndSupply.updatedAt,
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId))
        .innerJoin(unit, eq(materialAndSupply.unitId, unit.id));

    return materials.map((material) => ({
        ...material,
        status: getStatus(material.threshold as number, material.quantity),
        totalCost: getTotalCost(
            Number(material.costPerUnit),
            material.quantity,
        ),
        formattedQuantity: getQuantityWithUnit(
            material.quantity,
            material.unitAbbreviation,
        ),
    }));
};
