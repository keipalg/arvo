// ===========================================================================
// COGS
// ===========================================================================

import {
    DEFAULT_LABOR_COST_PCT,
    DEFAULT_OVERHEAD_COST_PCT,
    DEFAULT_PROFIT_MARGIN_PCT,
} from "./constants/accounting.js";

/**
 * Calculate Cost Per Unit (for COGS)
 * @param input amount of material
 * @param output units produced per input
 * @returns material cost per unit
 */
export const getMaterialCostPerUnit = (
    input: number,
    output: number,
): number => {
    return input / output;
};

/**
 * Calculate labor cost per unit (for COGS)
 * @param laborPct labor cost percentage, otherwise use default value
 * @param mcpu material cost per unit
 * @returns labor cost per unit
 */
export const getLaborCostPerUnit = (
    laborPct: number = DEFAULT_LABOR_COST_PCT,
    mcpu: number,
): number => {
    return laborPct * mcpu;
};

/**
 * Calculate overhead cost per unit (for COGS)
 * @param overheadPct overhead cost percentage, otherwise use default value
 * @param mcpu material cost per unit
 * @returns overhead cost per unit
 */
export const getOverheadCostPerUnit = (
    overheadPct: number = DEFAULT_OVERHEAD_COST_PCT,
    mcpu: number,
): number => {
    return overheadPct * mcpu;
};

/**
 * Calculate COGS (Cost of Goods Sold)
 * @param mcpu material cost per unit
 * @param laborCost labor cost per unit
 * @param overheadCost overhead cost per unit
 * @returns COGS
 */
export const getCOGS = (
    mcpu: number,
    laborCost: number,
    overheadCost: number,
): number => {
    return mcpu + laborCost + overheadCost;
};

// ===========================================================================
// OPERATING COST
// ===========================================================================
/**
 * Calculate Operating Cost based
 * @param operatingCostPct % from user settings, otherwise use default value
 * @param cogs cost of goods sold
 * @returns operating cost
 */
export const getOperatingCost = (
    operatingCostPct: number = DEFAULT_OVERHEAD_COST_PCT,
    cogs: number,
) => {
    return operatingCostPct * cogs;
};

// ===========================================================================
// SALE PRICE
// ===========================================================================
/**
 * Calculate sale price
 * @param cogs cost of good sold (COGS)
 * @param operatingCost operating cost
 * @param profitMarginPct profit margin percentage
 * @returns sale price of the product
 */
export const getSalePrice = (
    cogs: number,
    operatingCost: number,
    profitMarginPct: number = DEFAULT_PROFIT_MARGIN_PCT,
) => {
    return (cogs + operatingCost) / (1 - profitMarginPct);
};
