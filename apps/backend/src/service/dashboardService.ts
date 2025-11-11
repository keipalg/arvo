import { and, between, count, eq, sql, sum } from "drizzle-orm";
import { db } from "../db/client.js";
import {
    good,
    goodToMaterialOutputRatio,
    materialAndSupply,
    materialOutputRatio,
    operational_expense,
    productionBatch,
    sale,
    saleDetail,
} from "../db/schema.js";
import { getMonthRangeInTimezone } from "../utils/datetimeUtil.js";

export const getMonthlyReveneueLast6Months = async (
    userId: string,
    timezone: string,
) => {
    const tzLiteral = `'${timezone.replace(/'/g, "''")}'`;
    const monthExpr = sql<string>`to_char(${sale.date} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(tzLiteral)}, 'YYYY-MM')`;
    const results = await db
        .select({
            month: monthExpr,
            totalRevenue: sql<number>`cast(sum(${sale.totalPrice}) as float)`,
            totalProfit: sql<number>`cast(sum(${sale.profit}) as float)`,
        })
        .from(sale)
        .where(
            and(
                eq(sale.userId, userId),
                sql`${sale.date} AT TIME ZONE 'UTC' AT TIME ZONE ${sql.raw(tzLiteral)} >= (date_trunc('day', now() AT TIME ZONE ${sql.raw(tzLiteral)}) - INTERVAL '6 months')`,
            ),
        )
        .groupBy(monthExpr)
        .orderBy(monthExpr);
    return results;
};

export const getTotalProductsSold = async (
    userId: string,
    timezone: string,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, 0);
    const results = await db
        .select({
            totalSold: sql<number>`cast(sum(${saleDetail.quantity}) as int)`,
        })
        .from(sale)
        .innerJoin(saleDetail, eq(sale.id, saleDetail.saleId))
        .where(
            and(
                eq(sale.userId, userId),
                between(sale.date, targetMonth.start, targetMonth.end),
            ),
        );
    return results[0].totalSold ?? 0;
};

export const getSellingProducts = async (
    userId: string,
    timezone: string,
    order: "ASC" | "DESC" = "DESC",
    limit: number = 4,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, 0);

    const orderSql =
        order === "DESC"
            ? sql`cast(sum(${saleDetail.quantity}) as int) DESC`
            : sql`cast(sum(${saleDetail.quantity}) as int) ASC`;

    const results = await db
        .select({
            goodId: saleDetail.goodId,
            goodName: good.name,
            goodImage: good.image,
            goodsSold: sql<number>`cast(sum(${saleDetail.quantity}) as int)`,
        })
        .from(sale)
        .innerJoin(saleDetail, eq(sale.id, saleDetail.saleId))
        .innerJoin(good, eq(saleDetail.goodId, good.id))
        .where(
            and(
                eq(sale.userId, userId),
                between(sale.date, targetMonth.start, targetMonth.end),
            ),
        )
        .groupBy(saleDetail.goodId, good.name, good.image)
        .orderBy(orderSql)
        .limit(limit);
    return results;
};

export const getTopSellingProducts = async (
    userId: string,
    timezone: string,
) => {
    return await getSellingProducts(userId, timezone, "DESC", 5);
};

export const getMostSellingProductWithComparison = async (
    userId: string,
    timezone: string,
) => {
    const currentMonth = await getSellingProducts(userId, timezone, "DESC", 1);

    if (currentMonth.length === 0) {
        return {
            productName: "No sales",
            currentSales: 0,
            percentageChange: 0,
        };
    }

    const topProduct = currentMonth[0];
    const lastMonth = getMonthRangeInTimezone(timezone, -1);

    const lastMonthSales = await db
        .select({
            goodsSold: sql<number>`cast(sum(${saleDetail.quantity}) as int)`,
        })
        .from(sale)
        .innerJoin(saleDetail, eq(sale.id, saleDetail.saleId))
        .where(
            and(
                eq(sale.userId, userId),
                eq(saleDetail.goodId, topProduct.goodId),
                between(sale.date, lastMonth.start, lastMonth.end),
            ),
        );

    const lastMonthQuantity = lastMonthSales[0]?.goodsSold ?? 0;
    const percentageChange =
        lastMonthQuantity === 0
            ? 100
            : ((topProduct.goodsSold - lastMonthQuantity) / lastMonthQuantity) *
              100;

    return {
        productName: topProduct.goodName,
        currentSales: topProduct.goodsSold,
        percentageChange: Math.round(percentageChange * 100) / 100,
    };
};

export const getLeastSellingProducts = async (
    userId: string,
    timezone: string,
) => {
    return await getSellingProducts(userId, timezone, "ASC", 5);
};

export const getLeastSellingProductWithComparison = async (
    userId: string,
    timezone: string,
) => {
    const currentMonth = await getSellingProducts(userId, timezone, "ASC", 1);

    if (currentMonth.length === 0) {
        return {
            productName: "No sales",
            currentSales: 0,
            percentageChange: 0,
        };
    }

    const leastProduct = currentMonth[0];
    const lastMonth = getMonthRangeInTimezone(timezone, -1);

    const lastMonthSales = await db
        .select({
            goodsSold: sql<number>`cast(sum(${saleDetail.quantity}) as int)`,
        })
        .from(sale)
        .innerJoin(saleDetail, eq(sale.id, saleDetail.saleId))
        .where(
            and(
                eq(sale.userId, userId),
                eq(saleDetail.goodId, leastProduct.goodId),
                between(sale.date, lastMonth.start, lastMonth.end),
            ),
        );

    const lastMonthQuantity = lastMonthSales[0]?.goodsSold ?? 0;
    const percentageChange =
        lastMonthQuantity === 0
            ? 100
            : ((leastProduct.goodsSold - lastMonthQuantity) /
                  lastMonthQuantity) *
              100;

    return {
        productName: leastProduct.goodName,
        currentSales: leastProduct.goodsSold,
        percentageChange: Math.round(percentageChange * 100) / 100,
    };
};

export const getMonthlyMaterialExpense = async (
    userId: string,
    timezone: string,
    offset: number = 0,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, offset);
    const results = await db
        .select({
            totalMaterialExpense: sql<number>`cast(sum(${materialAndSupply.costPerUnit} * ${materialOutputRatio.input}) as float)`,
        })
        .from(sale)
        .innerJoin(saleDetail, eq(sale.id, saleDetail.saleId))
        .innerJoin(good, eq(saleDetail.goodId, good.id))
        .innerJoin(
            goodToMaterialOutputRatio,
            eq(goodToMaterialOutputRatio.goodId, good.id),
        )
        .innerJoin(
            materialOutputRatio,
            eq(
                materialOutputRatio.id,
                goodToMaterialOutputRatio.materialOutputRatioId,
            ),
        )
        .innerJoin(
            materialAndSupply,
            eq(materialAndSupply.id, materialOutputRatio.materialId),
        )
        .where(
            and(
                eq(sale.userId, userId),
                between(sale.date, targetMonth.start, targetMonth.end),
            ),
        );
    return results[0].totalMaterialExpense ?? 0;
};

export const getMonthlyTotalBusinessExpenses = async (
    userId: string,
    timezone: string,
    offset: number = 0,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, offset);
    const results = await db
        .select({
            totalExpense: sql<number>`cast(sum(${operational_expense.cost}) as float)`,
        })
        .from(operational_expense)
        .where(
            and(
                eq(operational_expense.user_id, userId),
                between(
                    operational_expense.createdAt,
                    targetMonth.start,
                    targetMonth.end,
                ),
            ),
        );
    return results[0].totalExpense;
};
export const getMonthlyBusinessExpenseWithType = async (
    userId: string,
    timezone: string,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, 0);
    const results = await db
        .select({
            expenceType: operational_expense.expense_type,
            totalExpense: sql<number>`cast(sum(${operational_expense.cost}) as float)`,
        })
        .from(operational_expense)
        .where(
            and(
                eq(operational_expense.user_id, userId),
                between(
                    operational_expense.createdAt,
                    targetMonth.start,
                    targetMonth.end,
                ),
            ),
        )
        .groupBy(operational_expense.expense_type);
    return results;
};

export const getMonthlyProductionCount = async (
    userId: string,
    timezone: string,
    offset: number = 0,
) => {
    const targetMonth = getMonthRangeInTimezone(timezone, offset);
    const results = await db
        .select({
            count: sql<number>`cast(sum(${productionBatch.quantity}) as int)`,
        })
        .from(productionBatch)
        .innerJoin(good, eq(productionBatch.goodId, good.id))
        .where(
            and(
                eq(good.userId, userId),
                between(
                    productionBatch.productionDate,
                    targetMonth.start.toISOString().split("T")[0],
                    targetMonth.end.toISOString().split("T")[0],
                ),
            ),
        );
    return results[0].count ?? 0;
};
