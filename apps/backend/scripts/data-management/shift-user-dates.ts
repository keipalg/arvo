import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../src/db/client.js";
import {
    productType,
    materialType,
    userPreference,
    materialAndSupply,
    good,
    materialOutputRatio,
    productionBatch,
    sale,
    saleDetail,
    studio_overhead_expense,
    operational_expense,
    materialInventoryTransaction,
} from "../../src/db/schema.js";
import { validateUserExists, validateMonth } from "./shared/validation.js";
import {
    shiftDateIfInMonth,
    getDateOffset,
    addDays,
    isInMonth,
} from "./shared/date-utils.js";

interface ShiftOptions {
    userId: string;
    sourceMonth: string; // YYYY-MM format
    targetMonth: string; // YYYY-MM format
}

async function parseArgs(): Promise<ShiftOptions> {
    const args = process.argv.slice(2);
    let userId: string | undefined;
    let sourceMonth: string | undefined;
    let targetMonth: string | undefined;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--userId=")) {
            userId = arg.split("=")[1];
        } else if (arg.startsWith("--sourceMonth=")) {
            sourceMonth = arg.split("=")[1];
        } else if (arg.startsWith("--targetMonth=")) {
            targetMonth = arg.split("=")[1];
        }
    }

    if (!userId || !sourceMonth || !targetMonth) {
        console.error(`
Usage: npm run shift-dates -- --userId=<uuid> --sourceMonth=<YYYY-MM> --targetMonth=<YYYY-MM>

Example:
  npm run shift-dates -- --userId="019a8a84-c7aa-750b-8d12-ab3618e219a4" --sourceMonth="2025-11" --targetMonth="2025-06"

Parameters:
  --userId        User UUID whose data to shift
  --sourceMonth   Month where data currently exists (format: YYYY-MM)
  --targetMonth   Month to shift data to (format: YYYY-MM)
        `);
        process.exit(1);
    }

    return { userId, sourceMonth, targetMonth };
}

async function shiftUserDates(options: ShiftOptions): Promise<void> {
    const startTime = Date.now();
    console.log("• Starting data shift operation...\n");

    // Step 1: Validation
    console.log("✓ Validating inputs...");
    await validateUserExists(options.userId);
    validateMonth(options.sourceMonth, false);
    validateMonth(options.targetMonth, false); // Allow any month (bi-directional)
    console.log(`✓ Source month: ${options.sourceMonth}`);
    console.log(`✓ Target month: ${options.targetMonth}`);

    // Step 2: Find ALL user records and shift dates in-place (no deletion needed)
    console.log(
        `\n✓ Shifting date fields in source month ${options.sourceMonth}...`,
    );

    let totalShifted = 0;

    // Step 4: Shift timestamps for each table
    // Note: We fetch ALL user records and conditionally shift only date fields in source month

    // 4.1: Product Types
    let productTypeCount = 0;
    const productTypes = await db
        .select()
        .from(productType)
        .where(eq(productType.userId, options.userId));

    for (const pt of productTypes) {
        const newCreatedAt = shiftDateIfInMonth(
            pt.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );
        const newUpdatedAt = shiftDateIfInMonth(
            pt.updatedAt,
            options.sourceMonth,
            options.targetMonth,
        );

        // Only update if at least one date changed
        if (newCreatedAt !== pt.createdAt || newUpdatedAt !== pt.updatedAt) {
            await db
                .update(productType)
                .set({
                    createdAt: newCreatedAt!,
                    updatedAt: newUpdatedAt!,
                })
                .where(eq(productType.id, pt.id));
            productTypeCount++;
        }
    }
    if (productTypeCount > 0) {
        console.log(`  ✓ Shifted ${productTypeCount} product types`);
        totalShifted += productTypeCount;
    }

    // 4.2: Material Types
    let materialTypeCount = 0;
    const materialTypes = await db
        .select()
        .from(materialType)
        .where(eq(materialType.userId, options.userId));

    for (const mt of materialTypes) {
        const newCreatedAt = shiftDateIfInMonth(
            mt.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );
        const newUpdatedAt = shiftDateIfInMonth(
            mt.updatedAt,
            options.sourceMonth,
            options.targetMonth,
        );

        if (newCreatedAt !== mt.createdAt || newUpdatedAt !== mt.updatedAt) {
            await db
                .update(materialType)
                .set({
                    createdAt: newCreatedAt!,
                    updatedAt: newUpdatedAt!,
                })
                .where(eq(materialType.id, mt.id));
            materialTypeCount++;
        }
    }
    if (materialTypeCount > 0) {
        console.log(`  ✓ Shifted ${materialTypeCount} material types`);
        totalShifted += materialTypeCount;
    }

    // 4.3: User Preferences
    let userPrefCount = 0;
    const userPrefs = await db
        .select()
        .from(userPreference)
        .where(eq(userPreference.userId, options.userId));

    for (const pref of userPrefs) {
        const newCreatedAt = shiftDateIfInMonth(
            pref.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );
        const newUpdatedAt = shiftDateIfInMonth(
            pref.updatedAt,
            options.sourceMonth,
            options.targetMonth,
        );

        if (
            newCreatedAt !== pref.createdAt ||
            newUpdatedAt !== pref.updatedAt
        ) {
            await db
                .update(userPreference)
                .set({
                    createdAt: newCreatedAt!,
                    updatedAt: newUpdatedAt!,
                })
                .where(eq(userPreference.id, pref.id));
            userPrefCount++;
        }
    }
    if (userPrefCount > 0) {
        console.log(`  ✓ Shifted ${userPrefCount} user preferences`);
        totalShifted += userPrefCount;
    }

    // 4.4: Materials and Supplies
    let materialCount = 0;
    const materials = await db
        .select()
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, options.userId));

    for (const material of materials) {
        const newCreatedAt = shiftDateIfInMonth(
            material.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );
        const newUpdatedAt = shiftDateIfInMonth(
            material.updatedAt,
            options.sourceMonth,
            options.targetMonth,
        );
        // Note: lastPurchaseDate is not shifted - it's a specific date, not a timestamp

        if (
            newCreatedAt !== material.createdAt ||
            newUpdatedAt !== material.updatedAt
        ) {
            await db
                .update(materialAndSupply)
                .set({
                    createdAt: newCreatedAt!,
                    updatedAt: newUpdatedAt!,
                })
                .where(eq(materialAndSupply.id, material.id));
            materialCount++;
        }
    }
    if (materialCount > 0) {
        console.log(`  ✓ Shifted ${materialCount} materials and supplies`);
        totalShifted += materialCount;
    }

    // 4.5: Goods
    let goodCount = 0;
    const goods = await db
        .select()
        .from(good)
        .where(eq(good.userId, options.userId));

    for (const g of goods) {
        const newCreatedAt = shiftDateIfInMonth(
            g.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );
        const newUpdatedAt = shiftDateIfInMonth(
            g.updatedAt,
            options.sourceMonth,
            options.targetMonth,
        );

        if (newCreatedAt !== g.createdAt || newUpdatedAt !== g.updatedAt) {
            await db
                .update(good)
                .set({
                    createdAt: newCreatedAt!,
                    updatedAt: newUpdatedAt!,
                })
                .where(eq(good.id, g.id));
            goodCount++;
        }
    }
    if (goodCount > 0) {
        console.log(`  ✓ Shifted ${goodCount} goods`);
        totalShifted += goodCount;
    }

    // 4.6: Material Output Ratios
    let ratioCount = 0;
    const goodIds = goods.map((g) => g.id);
    if (goodIds.length > 0) {
        const ratios = await db.select().from(materialOutputRatio);

        for (const ratio of ratios) {
            const newCreatedAt = shiftDateIfInMonth(
                ratio.createdAt,
                options.sourceMonth,
                options.targetMonth,
            );
            const newUpdatedAt = shiftDateIfInMonth(
                ratio.updatedAt,
                options.sourceMonth,
                options.targetMonth,
            );

            if (
                newCreatedAt !== ratio.createdAt ||
                newUpdatedAt !== ratio.updatedAt
            ) {
                await db
                    .update(materialOutputRatio)
                    .set({
                        createdAt: newCreatedAt!,
                        updatedAt: newUpdatedAt!,
                    })
                    .where(eq(materialOutputRatio.id, ratio.id));
                ratioCount++;
            }
        }
    }
    if (ratioCount > 0) {
        console.log(`  ✓ Shifted ${ratioCount} material output ratios`);
        totalShifted += ratioCount;
    }

    // 4.7: Production Batches
    let batchCount = 0;
    if (goodIds.length > 0) {
        const batches = await db
            .select()
            .from(productionBatch)
            .where(inArray(productionBatch.goodId, goodIds));

        for (const batch of batches) {
            const newProductionDate = shiftDateIfInMonth(
                new Date(batch.productionDate),
                options.sourceMonth,
                options.targetMonth,
            );
            const newCreatedAt = shiftDateIfInMonth(
                batch.createdAt,
                options.sourceMonth,
                options.targetMonth,
            );
            const newUpdatedAt = shiftDateIfInMonth(
                batch.updatedAt,
                options.sourceMonth,
                options.targetMonth,
            );

            if (
                newProductionDate !== new Date(batch.productionDate) ||
                newCreatedAt !== batch.createdAt ||
                newUpdatedAt !== batch.updatedAt
            ) {
                await db
                    .update(productionBatch)
                    .set({
                        productionDate: newProductionDate
                            ? newProductionDate.toISOString().split("T")[0]
                            : batch.productionDate,
                        createdAt: newCreatedAt!,
                        updatedAt: newUpdatedAt!,
                    })
                    .where(eq(productionBatch.id, batch.id));
                batchCount++;
            }
        }
    }
    if (batchCount > 0) {
        console.log(`  ✓ Shifted ${batchCount} production batches`);
        totalShifted += batchCount;
    }

    // 4.8: Sales
    let saleCount = 0;
    const sales = await db
        .select()
        .from(sale)
        .where(eq(sale.userId, options.userId));

    for (const s of sales) {
        const newDate = shiftDateIfInMonth(
            s.date,
            options.sourceMonth,
            options.targetMonth,
        );
        const newCreatedAt = shiftDateIfInMonth(
            s.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );
        const newUpdatedAt = shiftDateIfInMonth(
            s.updatedAt,
            options.sourceMonth,
            options.targetMonth,
        );

        if (
            newDate !== s.date ||
            newCreatedAt !== s.createdAt ||
            newUpdatedAt !== s.updatedAt
        ) {
            await db
                .update(sale)
                .set({
                    date: newDate!,
                    createdAt: newCreatedAt!,
                    updatedAt: newUpdatedAt!,
                })
                .where(eq(sale.id, s.id));
            saleCount++;
        }
    }
    if (saleCount > 0) {
        console.log(`  ✓ Shifted ${saleCount} sales`);
        totalShifted += saleCount;
    }

    // 4.9: Sale Details
    let saleDetailCount = 0;
    const saleIds = sales.map((s) => s.id);
    if (saleIds.length > 0) {
        const details = await db
            .select()
            .from(saleDetail)
            .where(inArray(saleDetail.saleId, saleIds));

        for (const detail of details) {
            const newCreatedAt = shiftDateIfInMonth(
                detail.createdAt,
                options.sourceMonth,
                options.targetMonth,
            );
            const newUpdatedAt = shiftDateIfInMonth(
                detail.updatedAt,
                options.sourceMonth,
                options.targetMonth,
            );

            if (
                newCreatedAt !== detail.createdAt ||
                newUpdatedAt !== detail.updatedAt
            ) {
                await db
                    .update(saleDetail)
                    .set({
                        createdAt: newCreatedAt!,
                        updatedAt: newUpdatedAt!,
                    })
                    .where(eq(saleDetail.id, detail.id));
                saleDetailCount++;
            }
        }
    }
    if (saleDetailCount > 0) {
        console.log(`  ✓ Shifted ${saleDetailCount} sale details`);
        totalShifted += saleDetailCount;
    }

    // 4.10: Studio Overhead Expenses
    let studioExpenseCount = 0;
    const studioExpenses = await db
        .select()
        .from(studio_overhead_expense)
        .where(eq(studio_overhead_expense.user_id, options.userId));

    for (const expense of studioExpenses) {
        const newCreatedAt = shiftDateIfInMonth(
            expense.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );

        // Handle future dates (preserve offset from createdAt)
        let newStartDate = expense.start_date;
        let newDueDate = expense.due_date;

        // Only recalculate offsets if createdAt is being shifted
        if (newCreatedAt !== expense.createdAt && newCreatedAt) {
            if (expense.start_date) {
                const offset = getDateOffset(
                    expense.createdAt,
                    expense.start_date,
                );
                newStartDate = addDays(newCreatedAt, offset);
            }

            if (expense.due_date) {
                const offset = getDateOffset(
                    expense.createdAt,
                    expense.due_date,
                );
                newDueDate = addDays(newCreatedAt, offset);
            }
        }

        if (
            newCreatedAt !== expense.createdAt ||
            newStartDate !== expense.start_date ||
            newDueDate !== expense.due_date
        ) {
            await db
                .update(studio_overhead_expense)
                .set({
                    createdAt: newCreatedAt!,
                    start_date: newStartDate,
                    due_date: newDueDate,
                })
                .where(eq(studio_overhead_expense.id, expense.id));
            studioExpenseCount++;
        }
    }
    if (studioExpenseCount > 0) {
        console.log(
            `  ✓ Shifted ${studioExpenseCount} studio overhead expenses`,
        );
        totalShifted += studioExpenseCount;
    }

    // 4.11: Operational Expenses
    let opExpenseCount = 0;
    const opExpenses = await db
        .select()
        .from(operational_expense)
        .where(eq(operational_expense.user_id, options.userId));

    for (const expense of opExpenses) {
        const newCreatedAt = shiftDateIfInMonth(
            expense.createdAt,
            options.sourceMonth,
            options.targetMonth,
        );

        // Handle future dates (preserve offset from createdAt)
        let newStartDate = expense.start_date;
        let newDueDate = expense.due_date;

        // Only recalculate offsets if createdAt is being shifted
        if (newCreatedAt !== expense.createdAt && newCreatedAt) {
            if (expense.start_date) {
                const offset = getDateOffset(
                    expense.createdAt,
                    expense.start_date,
                );
                newStartDate = addDays(newCreatedAt, offset);
            }

            if (expense.due_date) {
                const offset = getDateOffset(
                    expense.createdAt,
                    expense.due_date,
                );
                newDueDate = addDays(newCreatedAt, offset);
            }
        }

        if (
            newCreatedAt !== expense.createdAt ||
            newStartDate !== expense.start_date ||
            newDueDate !== expense.due_date
        ) {
            await db
                .update(operational_expense)
                .set({
                    createdAt: newCreatedAt!,
                    start_date: newStartDate,
                    due_date: newDueDate,
                })
                .where(eq(operational_expense.id, expense.id));
            opExpenseCount++;
        }
    }
    if (opExpenseCount > 0) {
        console.log(`  ✓ Shifted ${opExpenseCount} operational expenses`);
        totalShifted += opExpenseCount;
    }

    // 4.12: Material Inventory Transactions
    let transactionCount = 0;
    const materialIds = materials.map((m) => m.id);
    if (materialIds.length > 0) {
        const transactions = await db
            .select()
            .from(materialInventoryTransaction)
            .where(
                inArray(materialInventoryTransaction.materialId, materialIds),
            );

        for (const transaction of transactions) {
            const newCreatedAt = shiftDateIfInMonth(
                transaction.createdAt,
                options.sourceMonth,
                options.targetMonth,
            );

            if (newCreatedAt !== transaction.createdAt) {
                await db
                    .update(materialInventoryTransaction)
                    .set({
                        createdAt: newCreatedAt!,
                    })
                    .where(eq(materialInventoryTransaction.id, transaction.id));
                transactionCount++;
            }
        }
    }
    if (transactionCount > 0) {
        console.log(
            `  ✓ Shifted ${transactionCount} material inventory transactions`,
        );
        totalShifted += transactionCount;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
        `\n✓ Successfully shifted ${totalShifted} records from ${options.sourceMonth} to ${options.targetMonth}`,
    );
    console.log(`✓ Operation complete (${duration}s total)\n`);
}

// Main execution
parseArgs()
    .then((options) => shiftUserDates(options))
    .then(() => {
        console.log("Shift completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n✗ Shift failed:");
        console.error(error.message);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    });
