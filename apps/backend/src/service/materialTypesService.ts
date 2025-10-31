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
 * Add multiple material types
 * Note: This is adding distinct names only, duplicates are ignored
 * @param userId user ID
 * @param names list of material type names
 * @returns Inserted material type records
 */
export const addMaterialTypes = async (userId: string, names: string[]) => {
    const newMaterialTypes = names.map((name) => ({
        id: uuidv7(),
        userId: userId,
        name: name,
    }));

    // Get existing material type names for user
    const existingNames = (
        await db
            .select({ name: materialType.name })
            .from(materialType)
            .where(eq(materialType.userId, userId))
    ).map((mt) => mt.name);

    // Logic to filter out and not add duplicate types
    const newUniqueMaterialTypes = newMaterialTypes.filter((mt) => {
        const isUnique = !existingNames.includes(mt.name);
        if (!isUnique) {
            console.log(
                `Skipping duplicate material type: "${mt.name}" for user ${userId}`,
            );
        }
        return isUnique;
    });

    if (newUniqueMaterialTypes.length === 0) {
        console.log("No new unique material types to add.");
        return [];
    }

    const insertedMaterialTypes = await db
        .insert(materialType)
        .values(newUniqueMaterialTypes)
        .returning();

    return insertedMaterialTypes;
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
