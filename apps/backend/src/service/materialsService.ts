import { and, eq, type InferInsertModel } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db, type NeonDbTx } from "../db/client.js";
import {
    materialAndSupply,
    materialInventoryTransaction,
    materialType,
    unit,
} from "../db/schema.js";
import { getQuantityWithUnit } from "../utils/materialsUtil.js";
import { getStatus } from "src/utils/inventoryUtil.js";
import { createMaterialLowInventoryNotification } from "./notificationsService.js";

/**
 * Compute cost per unit
 * @param purchasePrice Total purchase price
 * @param quantity Quantity purchased
 * @returns Cost per unit
 */
const computeCostPerUnit = (
    purchasePrice: number,
    quantity: number,
): number => {
    if (quantity === 0) {
        throw new Error("Quantity cannot be zero when computing cost per unit");
    }
    return purchasePrice / quantity;
};

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
            materialTypeId: materialAndSupply.materialTypeId,
            materialType: materialType.name,
            unitName: unit.name,
            unitAbbreviation: unit.abbreviation,
            quantity: materialAndSupply.quantity,
            costPerUnit: materialAndSupply.costPerUnit,
            purchasePrice: materialAndSupply.purchasePrice,
            purchaseQuantity: materialAndSupply.purchaseQuantity,
            lastPurchaseDate: materialAndSupply.lastPurchaseDate,
            supplier: materialAndSupply.supplier,
            supplierUrl: materialAndSupply.supplierUrl,
            notes: materialAndSupply.notes,
            threshold: materialAndSupply.threshold,
            lastUpdatedDate: materialAndSupply.updatedAt,
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId))
        .innerJoin(
            materialType,
            eq(materialAndSupply.materialTypeId, materialType.id),
        )
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
 * Detele a material by ID
 * For Materials page
 * @param materialId material ID
 */
export const deleteMaterial = async (materialId: string) => {
    await db
        .delete(materialAndSupply)
        .where(eq(materialAndSupply.id, materialId));
};

// Exclude auto-computed fields from insert type:
// - costPerUnit: computed as purchasePrice / quantity
// - purchaseQuantity: set equal to quantity on initial insert
export type MaterialInsert = Omit<
    InferInsertModel<typeof materialAndSupply>,
    "costPerUnit" | "purchaseQuantity"
>;
/**
 * Add a new material to the database
 * For Materials page
 * @param data MaterialInsert data (must include purchasePrice and quantity)
 * @returns Inserted material ID
 */
export const addMaterial = async (data: MaterialInsert) => {
    try {
        // Compute cost per unit from purchasePrice and quantity
        const costPerUnit = computeCostPerUnit(
            data.purchasePrice,
            data.quantity,
        );

        return await db.transaction(async (tx) => {
            const materialId = uuidv7();

            // Insert material
            const [insertedMaterial] = await tx
                .insert(materialAndSupply)
                .values({
                    id: materialId,
                    userId: data.userId,
                    name: data.name,
                    materialTypeId: data.materialTypeId,
                    unitId: data.unitId,
                    quantity: data.quantity,
                    // For bulk purchase price, to determine cost per unit
                    purchasePrice: data.purchasePrice,
                    // For bulk purchase price, initialized by quantity
                    purchaseQuantity: data.quantity,
                    costPerUnit: costPerUnit,
                    lastPurchaseDate: data.lastPurchaseDate,
                    supplier: data.supplier,
                    supplierUrl: data.supplierUrl,
                    notes: data.notes,
                    threshold: data.threshold,
                })
                .returning({ id: materialAndSupply.id });

            // Record transaction for initial stock
            await tx.insert(materialInventoryTransaction).values({
                id: uuidv7(),
                materialId: materialId,
                userId: data.userId,
                quantityChange: data.quantity,
                quantityBefore: 0,
                quantityAfter: data.quantity,
            });

            return [insertedMaterial];
        });
    } catch (error) {
        console.error("Error adding material:", error);
        throw error;
    }
};

export type MaterialUpdate = Partial<
    Omit<MaterialInsert, "id" | "userId" | "createdAt" | "updatedAt">
> & {
    purchaseQuantity?: number; // Override mandatory field with optional during update
};
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
    return await db.transaction(async (tx) => {
        // Get current material state
        const [currentMaterial] = await tx
            .select()
            .from(materialAndSupply)
            .where(
                and(
                    eq(materialAndSupply.id, materialId),
                    eq(materialAndSupply.userId, userId),
                ),
            );

        if (!currentMaterial) {
            throw new Error("Material not found");
        }

        // Compute costPerUnit if purchasePrice and purchaseQuantity are both provided (from Update Material Pricing)
        const updateData: MaterialUpdate & { costPerUnit?: number } = {
            ...data,
        };

        // Recalculate costPerUnit if BOTH purchasePrice and purchaseQuantity are provided (for Update Material Pricing)
        if (
            data.purchasePrice !== undefined &&
            data.purchaseQuantity !== undefined &&
            data.purchaseQuantity !== null
        ) {
            updateData.costPerUnit = computeCostPerUnit(
                data.purchasePrice,
                data.purchaseQuantity,
            );
        }

        // Update material
        const result = await tx
            .update(materialAndSupply)
            .set(updateData)
            .where(
                and(
                    eq(materialAndSupply.id, materialId),
                    eq(materialAndSupply.userId, userId),
                ),
            )
            .returning({ id: materialAndSupply.id });

        // Record transaction if quantity changed
        if (
            data.quantity !== undefined &&
            data.quantity !== currentMaterial.quantity
        ) {
            const quantityChange = data.quantity - currentMaterial.quantity;

            await tx.insert(materialInventoryTransaction).values({
                id: uuidv7(),
                materialId,
                userId,
                quantityChange,
                quantityBefore: currentMaterial.quantity,
                quantityAfter: data.quantity,
            });
        }

        // Check inventory and notify if needed when quantity or threshold changed
        if (data.quantity !== undefined || data.threshold !== undefined) {
            // Use the updated values from the transaction
            const finalQuantity =
                data.quantity !== undefined
                    ? data.quantity
                    : currentMaterial.quantity;
            const finalThreshold =
                data.threshold !== undefined
                    ? data.threshold
                    : currentMaterial.threshold;

            await _checkAndNotifyLowInventory(
                materialId,
                userId,
                tx,
                finalQuantity,
                finalThreshold,
            );
        }

        return result;
    });
};

/**
 * Private helper to check material inventory and create notification if below threshold
 * @param materialId material ID
 * @param userId user ID
 * @param tx database transaction context (defaults to db if not provided)
 * @param quantity quantity value (optional - if provided, skips quantity query)
 * @param threshold threshold value (optional - if provided, skips threshold query)
 */
const _checkAndNotifyLowInventory = async (
    materialId: string,
    userId: string,
    tx: NeonDbTx = db,
    quantity?: number,
    threshold?: number | null,
) => {
    // If quantity and threshold are provided, use them directly
    // Otherwise, fetch from database
    let materialData: {
        name: string;
        materialTypeName: string;
        quantity: number;
        threshold: number | null;
        unitAbbreviation: string;
    };

    if (quantity !== undefined && threshold !== undefined) {
        // Get other notification info using the transaction context
        const material = await tx
            .select({
                name: materialAndSupply.name,
                materialTypeName: materialType.name,
                unitAbbreviation: unit.abbreviation,
            })
            .from(materialAndSupply)
            .where(
                and(
                    eq(materialAndSupply.id, materialId),
                    eq(materialAndSupply.userId, userId),
                ),
            )
            .innerJoin(
                materialType,
                eq(materialAndSupply.materialTypeId, materialType.id),
            )
            .innerJoin(unit, eq(materialAndSupply.unitId, unit.id))
            .limit(1)
            .then((result) => result[0]);

        if (!material) {
            return;
        }

        materialData = {
            ...material,
            quantity,
            threshold,
        };
    } else {
        // Fetch all data including quantity and threshold
        const material = await tx
            .select({
                name: materialAndSupply.name,
                materialTypeName: materialType.name,
                quantity: materialAndSupply.quantity,
                threshold: materialAndSupply.threshold,
                unitAbbreviation: unit.abbreviation,
            })
            .from(materialAndSupply)
            .where(
                and(
                    eq(materialAndSupply.id, materialId),
                    eq(materialAndSupply.userId, userId),
                ),
            )
            .innerJoin(
                materialType,
                eq(materialAndSupply.materialTypeId, materialType.id),
            )
            .innerJoin(unit, eq(materialAndSupply.unitId, unit.id))
            .limit(1)
            .then((result) => result[0]);

        if (!material) {
            return;
        }

        materialData = material;
    }

    // Debug logging
    console.log("Checking inventory notification:", {
        materialName: materialData.name,
        quantity: materialData.quantity,
        threshold: materialData.threshold,
        shouldAlert: materialData.quantity < (materialData.threshold as number),
    });

    // Check if quantity is below threshold (low stock), then create notification
    if (
        materialData.threshold !== null &&
        materialData.quantity < (materialData.threshold as number)
    ) {
        console.log(
            "Creating low inventory notification for:",
            materialData.name,
        );
        await createMaterialLowInventoryNotification(
            userId,
            materialData.materialTypeName,
            materialData.name,
            materialData.threshold as number,
            materialData.unitAbbreviation,
        );
    }
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
 * For reducing material quantity
 * Used for: production, inventory loss, etc.
 * @param materialId material ID
 * @param userId user ID
 * @param quantityToDeduct quantity to deduct
 * @param tx database transaction
 * @returns Updated material ID and new quantity
 */
export const reduceMaterialQuantity = async (
    materialId: string,
    userId: string,
    quantityToDeduct: number,
    tx: NeonDbTx = db,
) => {
    // Get first match
    const [material] = await tx
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

    const result = await tx
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

    // Record transaction
    await tx.insert(materialInventoryTransaction).values({
        id: uuidv7(),
        materialId,
        userId,
        quantityChange: -quantityToDeduct,
        quantityBefore: material.quantity,
        quantityAfter: newQuantity,
    });

    await _checkAndNotifyLowInventory(materialId, userId);

    return result;
};

/**
 * Add material quantity when batch record / loss is deleted
 * Used for: production, inventory loss, etc.
 * @param materialId material ID
 * @param userId user ID
 * @param quantityToAdd quantity to Add
 * @param tx Database transaction
 * @returns Updated material ID and new quantity
 */
export const addMaterialQuantity = async (
    materialId: string,
    userId: string,
    quantityToAdd: number,
    tx: NeonDbTx = db,
) => {
    // Get first match
    const [material] = await tx
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

    const newQuantity = material.quantity + quantityToAdd;

    const result = await tx
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

    // Record transaction
    await tx.insert(materialInventoryTransaction).values({
        id: uuidv7(),
        materialId,
        userId,
        quantityChange: quantityToAdd,
        quantityBefore: material.quantity,
        quantityAfter: newQuantity,
    });

    return result;
};
