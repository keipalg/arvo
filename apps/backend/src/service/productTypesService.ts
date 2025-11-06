import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import { productType, good } from "../db/schema.js";

/**
 * Get all product types for a specific user
 * @param userId user ID
 * @returns List of product types
 */
export const getProductTypes = async (userId: string) => {
    return await db
        .select()
        .from(productType)
        .where(eq(productType.userId, userId));
};

/**
 * Add a new product type
 * @param userId user ID
 * @param name product type name
 * @returns Inserted product type record
 */
export const addProductType = async (userId: string, name: string) => {
    const [newProductType] = await db
        .insert(productType)
        .values({
            id: uuidv7(),
            userId: userId,
            name: name,
        })
        .returning();

    return newProductType;
};

/**
 * Add multiple product types
 * Note: This is adding distinct names only, duplicates are ignored
 * @param userId user ID
 * @param names list of product type names
 * @returns Inserted product type records
 */
export const addProductTypes = async (userId: string, names: string[]) => {
    const newProductTypes = names.map((name) => ({
        id: uuidv7(),
        userId: userId,
        name: name,
    }));

    // Get existing product type names for user
    const existingNames = (
        await db
            .select({ name: productType.name })
            .from(productType)
            .where(eq(productType.userId, userId))
    ).map((mt) => mt.name);

    // Logic to filter out and not add duplicate types
    const newUniqueProductTypes = newProductTypes.filter((mt) => {
        const isUnique = !existingNames.includes(mt.name);
        if (!isUnique) {
            console.log(
                `Skipping duplicate product type: "${mt.name}" for user ${userId}`,
            );
        }
        return isUnique;
    });

    if (newUniqueProductTypes.length === 0) {
        console.log("No new unique product types to add.");
        return [];
    }

    const insertedProductTypes = await db
        .insert(productType)
        .values(newUniqueProductTypes)
        .returning();

    return insertedProductTypes;
};

/**
 * Delete a product type by ID
 * @param productTypeId product type ID
 */
export const deleteProductType = async (productTypeId: string) => {
    const isUsed = await isProductTypeUsed(productTypeId);
    if (isUsed) {
        throw new Error(
            "Cannot delete product type: it is being used by existing products",
        );
    }
    await db.delete(productType).where(eq(productType.id, productTypeId));
};

/**
 * Update a product type by ID
 * @param productTypeId product type ID
 * @param name new name for the product type
 */
export const updateProductType = async (
    productTypeId: string,
    name: string,
) => {
    await db
        .update(productType)
        .set({ name: name })
        .where(eq(productType.id, productTypeId));
};

// check the type is used in product or not
export const isProductTypeUsed = async (productTypeId: string) => {
    const goods = await db
        .select({ id: good.id })
        .from(good)
        .where(eq(good.productTypeId, productTypeId))
        .limit(1);
    return goods.length > 0;
};

/**
 * Get all product types with usage status for a specific user
 * @param userId user ID
 * @returns List of product types with isUsed flag
 */
export const getProductTypesWithUsage = async (userId: string) => {
    const types = await getProductTypes(userId);
    return Promise.all(
        types.map(async (type) => ({
            ...type,
            isUsed: await isProductTypeUsed(type.id),
        })),
    );
};
