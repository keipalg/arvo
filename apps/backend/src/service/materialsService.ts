import { and, eq, type InferInsertModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { materialAndSupply, unit } from "../db/schema.js";
import { getQuantityWithUnit, getStatus } from "../utils/materialsUtil.js";

/**
 * Get list of materials for a specific user
 * @param userId
 * @returns List of materials with status and formatted quantity
 */
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

/**
 * Get material by ID for a specific user
 * @param materialId material ID
 * @param userId user ID
 * @returns Material record or undefined if not found
 */
export const getMaterialById = async (materialId: string, userId: string) => {
    return await db
        .select()
        .from(materialAndSupply)
        .where(
            and(
                eq(materialAndSupply.id, materialId),
                eq(materialAndSupply.userId, userId),
            ),
        )
        .limit(1)
        .then((result) => result[0]);
};

/**
 * // TODO: to update logic after schema update
 * Get distinct material types for a specific user
 * @param userId user ID
 * @returns List of distinct material types
 */
export const getMaterialTypes = async (userId: string) => {
    return await db
        .selectDistinct({
            type: materialAndSupply.materialType,
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId));
};

/**
 * Detele a material by ID
 * For Materials page
 * @param materialId material ID
 */
export const deleteMaterial = async (materialId: string) => {
    await db
        .delete(materialAndSupply)
        .where(eq(materialAndSupply.id, materialId));
};

export type MaterialInsert = InferInsertModel<typeof materialAndSupply>;
/**
 * Add a new material to the database
 * For Materials page
 * @param data MaterialInsert data
 * @returns Inserted material ID
 */
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
/**
 * To be used by Materials page when updating material information
 * For Materials page
 * @param materialId material ID
 * @param userId user ID
 * @param data MaterialUpdate data
 * @returns Updated material ID
 */
export const updateMaterial = async (
    materialId: string,
    userId: string,
    data: MaterialUpdate,
) => {
    return await db
        .update(materialAndSupply)
        .set(data)
        .where(
            and(
                eq(materialAndSupply.id, materialId),
                eq(materialAndSupply.userId, userId),
            ),
        )
        .returning({ id: materialAndSupply.id });
};

/**
 * Get material list for recipe / pricing operations
 * For Products - Recipe (Pricing)
 * @param userId user ID
 * @returns List of materials with ID, name, quantity, unit abbreviation, and cost per unit
 */
export const getMaterialListForRecipe = async (userId: string) => {
    return await db
        .select({
            id: materialAndSupply.id,
            name: materialAndSupply.name,
            quantity: materialAndSupply.quantity,
            unitAbbreviation: unit.abbreviation,
            costPerUnit: materialAndSupply.costPerUnit,
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId))
        .innerJoin(unit, eq(materialAndSupply.unitId, unit.id));
};

/**
 * Get material list for batch operations
 * For Products - Batch (Production)
 * @param userId user ID
 * @returns List of materials with ID, name, quantity, and unit abbreviation
 */
export const getMaterialListForBatch = async (userId: string) => {
    return await db
        .select({
            id: materialAndSupply.id,
            name: materialAndSupply.name,
            quantity: materialAndSupply.quantity,
            unitAbbreviation: unit.abbreviation,
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId))
        .innerJoin(unit, eq(materialAndSupply.unitId, unit.id));
};

/**
 * For reducing material quantity when used in production
 * For Products - Batch (Production)
 * @param materialId
 * @param userId
 * @param quantityToDeduct
 * @returns Updated material ID and new quantity
 */
export const reduceMaterialQuantity = async (
    materialId: string,
    userId: string,
    quantityToDeduct: number,
) => {
    // Get first match
    const [material] = await db
        .select()
        .from(materialAndSupply)
        .where(
            and(
                eq(materialAndSupply.id, materialId),
                eq(materialAndSupply.userId, userId),
            ),
        )
        .limit(1);

    if (!material) {
        throw new Error("Material not found");
    }

    if (material.quantity < quantityToDeduct) {
        throw new Error(
            `Insufficient quantity. Available: ${material.quantity}, Requested: ${quantityToDeduct}`,
        );
    }

    const newQuantity = material.quantity - quantityToDeduct;

    return await db
        .update(materialAndSupply)
        .set({ quantity: newQuantity })
        .where(
            and(
                eq(materialAndSupply.id, materialId),
                eq(materialAndSupply.userId, userId),
            ),
        )
        .returning({
            id: materialAndSupply.id,
            quantity: materialAndSupply.quantity,
        });
};
