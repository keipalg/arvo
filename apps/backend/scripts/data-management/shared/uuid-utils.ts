import { v7 as uuidv7 } from "uuid";

/**
 * Generate a new UUID v7
 */
export function generateUUID(): string {
    return uuidv7();
}

/**
 * Create UUID mapping for a list of records
 * Returns Map of oldId → newId
 */
export function createUUIDMapping(oldIds: string[]): Map<string, string> {
    const mapping = new Map<string, string>();
    for (const oldId of oldIds) {
        mapping.set(oldId, generateUUID());
    }
    return mapping;
}

/**
 * Replace UUID in an object using the mapping
 * Returns the new UUID if found in mapping, otherwise returns the original value
 */
export function replaceUUID(
    value: string | null | undefined,
    mapping: Map<string, string>,
): string | null | undefined {
    if (!value) return value;
    return mapping.get(value) || value;
}

/**
 * Create a comprehensive UUID map for all entity types
 */
export interface UUIDMaps {
    productTypes: Map<string, string>;
    materialTypes: Map<string, string>;
    materials: Map<string, string>;
    goods: Map<string, string>;
    materialOutputRatios: Map<string, string>;
    productionBatches: Map<string, string>;
    sales: Map<string, string>;
    userPreferences: Map<string, string>;
    studioExpenses: Map<string, string>;
    operationalExpenses: Map<string, string>;
    inventoryTransactions: Map<string, string>;
    saleDetails: Map<string, string>;
}

export function createEmptyUUIDMaps(): UUIDMaps {
    return {
        productTypes: new Map(),
        materialTypes: new Map(),
        materials: new Map(),
        goods: new Map(),
        materialOutputRatios: new Map(),
        productionBatches: new Map(),
        sales: new Map(),
        userPreferences: new Map(),
        studioExpenses: new Map(),
        operationalExpenses: new Map(),
        inventoryTransactions: new Map(),
        saleDetails: new Map(),
    };
}
