import {
    and,
    desc,
    eq,
    inArray,
    type InferInsertModel,
    lt,
    sql,
} from "drizzle-orm";
import { getStatus } from "../utils/inventoryUtil.js";
import { v7 as uuidv7 } from "uuid";
import { db, type NeonDbTx } from "../db/client.js";
import {
    goodToMaterialOutputRatio,
    materialAndSupply,
    materialInventoryTransaction,
    materialOutputRatio,
    materialType,
    unit,
} from "../db/schema.js";
import { getQuantityWithUnit } from "../utils/materialsUtil.js";
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
            createdAt: materialAndSupply.createdAt,
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
 * Check if a material is being used in product recipes
 * For Materials page - Delete confirmation
 * @param materialId material ID
 * @returns Object indicating if material is in use
 */
export const checkMaterialUsage = async (materialId: string) => {
    // Step 1: Find all material_output_ratio entries for this material
    const outputRatios = await db
        .select({ id: materialOutputRatio.id })
        .from(materialOutputRatio)
        .where(eq(materialOutputRatio.materialId, materialId));

    // Step 2: Check if any of these ratios are linked to goods
    let isUsed = false;
    if (outputRatios.length > 0) {
        const ratioIds = outputRatios.map((ratio) => ratio.id);
        const linkedGoods = await db
            .select()
            .from(goodToMaterialOutputRatio)
            .where(
                inArray(
                    goodToMaterialOutputRatio.materialOutputRatioId,
                    ratioIds,
                ),
            );

        isUsed = linkedGoods.length > 0;
    }

    return {
        isUsed,
    };
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

/**
 * Get the most used material for the current month and compare with same material last month
 * Used for: Materials page insights
 * @param userId user ID
 * @returns Material name and percentage change (or null with 0% if no data)
 */
export const getMostUsedMaterial = async (userId: string) => {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    );
    const firstDayOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
    );
    const firstDayOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
    );

    // Query: Get most used materjial of the month
    // Get total negative quantity changes (usage) (absolute value)
    // GROUP BY material (with name & unit for getting info)
    const currentMonthData = await db
        .select({
            materialId: materialAndSupply.id,
            materialName: materialAndSupply.name,
            totalUsed: sql<number>`SUM(ABS(${materialInventoryTransaction.quantityChange}))`,
        })
        .from(materialInventoryTransaction)
        .innerJoin(
            materialAndSupply,
            eq(materialInventoryTransaction.materialId, materialAndSupply.id),
        )
        .where(
            and(
                eq(materialInventoryTransaction.userId, userId),
                lt(materialInventoryTransaction.quantityChange, 0), // Only negative changes (usage/reduction)
                sql`${materialInventoryTransaction.createdAt} >= ${firstDayOfCurrentMonth}`, // Current month start
                sql`${materialInventoryTransaction.createdAt} < ${firstDayOfNextMonth}`, // Current month end
            ),
        )
        .groupBy(materialAndSupply.id, materialAndSupply.name)
        .orderBy(
            // Highest usage first
            desc(sql`SUM(ABS(${materialInventoryTransaction.quantityChange}))`),
        )
        .limit(1);

    // Scenario 1: No data for this month - return null with 0% change
    if (currentMonthData.length === 0) {
        return {
            materialName: null,
            percentageChange: 0,
        };
    }

    // Query: Get previous month usage for same material for comparison
    const lastMonthUsageData = await db
        .select({
            totalUsed: sql<number>`SUM(ABS(${materialInventoryTransaction.quantityChange}))`,
        })
        .from(materialInventoryTransaction)
        .where(
            and(
                eq(materialInventoryTransaction.userId, userId),
                eq(
                    materialInventoryTransaction.materialId,
                    currentMonthData[0].materialId,
                ), // Same material as current month's top
                lt(materialInventoryTransaction.quantityChange, 0),
                // use sql for type purposes
                sql`${materialInventoryTransaction.createdAt} >= ${firstDayOfLastMonth}`,
                sql`${materialInventoryTransaction.createdAt} < ${firstDayOfCurrentMonth}`,
            ),
        );

    const lastMonthUsage = lastMonthUsageData[0]?.totalUsed || 0;

    // Scenario 2: No data for same material last month - assume 0%
    // Scenario 3: Data exists for same material last month - compute percent change
    let percentageChange = 0;
    if (lastMonthUsage > 0) {
        percentageChange =
            ((currentMonthData[0].totalUsed - lastMonthUsage) /
                lastMonthUsage) *
            100;
    }

    console.log(`Most Used Material:
        Name: ${currentMonthData[0].materialName}
        Current Usage: ${currentMonthData[0].totalUsed}
        Last Month Usage: ${lastMonthUsage}
        Percentage Change: ${percentageChange}
        `);

    return {
        materialName: currentMonthData[0].materialName,
        percentageChange,
    };
};

/**
 * Get count of materials that are low on stock (quantity < threshold)
 * Used for: Materials page insights
 * @param userId user ID
 * @returns Count of materials below threshold
 */
export const getMaterialsLowOnStock = async (userId: string) => {
    const result = await db
        .select({
            count: sql<number>`COUNT(*)`,
        })
        .from(materialAndSupply)
        .where(
            and(
                eq(materialAndSupply.userId, userId),
                sql`${materialAndSupply.threshold} IS NOT NULL`, // only for materials with treshold
                sql`${materialAndSupply.quantity} < ${materialAndSupply.threshold}`,
            ),
        );

    return {
        count: result[0]?.count || 0,
    };
};

/**
 * Get total inventory value with comparison to last month
 * Used for: Materials page insights
 * @param userId user ID
 * @returns Current and last month total inventory value with percentage change
 */
export const getTotalInventoryValue = async (userId: string) => {
    // Query: Get current total inventory value
    const currentValueResult = await db
        .select({
            totalValue: sql<number>`SUM(${materialAndSupply.costPerUnit} * ${materialAndSupply.quantity})`, // Sum of (cost per unit × quantity)
        })
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, userId));

    const currentValue = currentValueResult[0]?.totalValue || 0;

    const now = new Date();
    const firstDayOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    );

    // Query: Get last month's inventory

    const lastMonthValueResult = await db.execute(sql`
        SELECT SUM(m.cost_per_unit * mit.quantity_after) AS last_month_value
        FROM (
            SELECT DISTINCT ON (mit.material_id)
                mit.material_id,
                mit.quantity_after
            FROM material_inventory_transaction mit
            WHERE mit.user_id = ${userId}
            AND mit.created_at < ${firstDayOfCurrentMonth}
            ORDER BY mit.material_id, mit.created_at DESC
        ) mit
        JOIN material_and_supply m ON mit.material_id = m.id
`);

    const lastMonthValue =
        Number(lastMonthValueResult.rows[0]?.last_month_value) || 0;

    let percentageChange = 0;
    if (lastMonthValue > 0) {
        percentageChange =
            ((currentValue - lastMonthValue) / lastMonthValue) * 100;
    }

    console.log(currentValue);

    return {
        currentValue,
        lastMonthValue,
        percentageChange,
    };
};
