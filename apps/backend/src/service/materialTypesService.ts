import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import { materialType } from "../db/schema.js";

/**
 * Get all material types for a specific user
 * @param userId user ID
 * @returns List of material types
 */
export const getMaterialTypes = async (userId: string) => {
    return await db
        .select()
        .from(materialType)
        .where(eq(materialType.userId, userId));
};

/**
 * Add a new material type
 * @param userId user ID
 * @param name material type name
 * @returns Inserted material type record
 */
export const addMaterialType = async (userId: string, name: string) => {
    const [newMaterialType] = await db
        .insert(materialType)
        .values({
            id: uuidv7(),
            userId: userId,
            name: name,
        })
        .returning();

    return newMaterialType;
};

/**
 * Delete a material type by ID
 * @param materialTypeId material type ID
 */
export const deleteMaterialType = async (materialTypeId: string) => {
    await db.delete(materialType).where(eq(materialType.id, materialTypeId));
};

/**
 * Update a material type by ID
 * @param materialTypeId material type ID
 * @param name new name for the material type
 */
export const updateMaterialType = async (
    materialTypeId: string,
    name: string,
) => {
    await db
        .update(materialType)
        .set({ name: name })
        .where(eq(materialType.id, materialTypeId));
};
