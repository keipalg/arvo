import { eq, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { materialAndSupply, unit } from "../db/schema.js";
import { getQuantityWithUnit, getStatus } from "../utils/materialsUtil.js";

export const getMaterialsList = async (userId: string) => {
    const materials = await db
        .select({
            id: materialAndSupply.id,
            name: materialAndSupply.name,
            type: materialAndSupply.materialType,
            unitName: unit.name,
            unitAbbreviation: unit.abbreviation,
            quantity: materialAndSupply.quantity,
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
        formattedQuantity: getQuantityWithUnit(
            material.quantity,
            material.unitAbbreviation,
        ),
    }));
};

export const getMaterialTypes = async (userId: string) => {
    return await db
        .selectDistinct({
            type: materialAndSupply.materialType,
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId));
};

export const deleteMaterial = async (materialId: string) => {
    await db
        .delete(materialAndSupply)
        .where(eq(materialAndSupply.id, materialId));
};

export type MaterialInsert = InferInsertModel<typeof materialAndSupply>;
export const addMaterial = async (data: MaterialInsert) => {
    return await db
        .insert(materialAndSupply)
        .values({
            id: crypto.randomUUID(),
            userId: data.userId,
            name: data.name,
            materialType: data.materialType,
            unitId: data.unitId,
            quantity: data.quantity,
            costPerUnit: data.costPerUnit,
            lastPurchaseDate: data.lastPurchaseDate,
            supplier: data.supplier,
            notes: data.notes,
            threshold: data.threshold,
        })
        .returning({ id: materialAndSupply.id });
};

export type MaterialUpdate = Partial<
    Omit<MaterialInsert, "id" | "userId" | "createdAt" | "updatedAt">
>;
export const updateMaterial = async (
    materialId: string,
    userId: string,
    data: MaterialUpdate,
) => {
    return await db
        .update(materialAndSupply)
        .set(data)
        .where(
            eq(materialAndSupply.id, materialId) &&
                eq(materialAndSupply.userId, userId),
        )
        .returning({ id: materialAndSupply.id });
};
