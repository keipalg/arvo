// ===========================================================================
// COGS
// ===========================================================================

import {
    DEFAULT_OPERATING_COST_PCT,
    DEFAULT_OVERHEAD_COST_PCT,
    DEFAULT_PROFIT_MARGIN_PCT,
} from "../../../backend/src/utils/constants/accounting.js";

/**
 * Calculate Total Material Cost per product (COGS)
 * @param input list of material costs
 * @returns total material cost
 */
export const getTotalMaterialCost = (...input: number[]): number => {
    return input.reduce((acc, curr) => acc + curr, 0);
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
    operatingCostPct: number = DEFAULT_OPERATING_COST_PCT,
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

//===========================================================================
// Net profit margine
// ===========================================================================

/**
 * Calculate sale price
 * @param salesPrice retail price user inputed
 * @param cogs cost of good sold (COGS)
 * @param operatingCost operating cost
 * @param profitMarginPct profit margin percentage
 * @returns sale price of the product
 */
export const getNetProfitMargine = (
    salesPrice: number,
    cogs: number,
    operatingCost: number,
) => {
    return ((salesPrice - (cogs + operatingCost)) / salesPrice) * 100;
};
