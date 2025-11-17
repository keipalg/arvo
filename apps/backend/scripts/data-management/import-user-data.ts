import "dotenv/config";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../../src/db/client.js";
import {
    productType,
    materialType,
    userPreference,
    materialAndSupply,
    good,
    materialOutputRatio,
    goodToMaterialOutputRatio,
    productionBatch,
    sale,
    saleDetail,
    studio_overhead_expense,
    operational_expense,
    materialInventoryTransaction,
} from "../../src/db/schema.js";
import { validateUserExists } from "./shared/validation.js";
import { getMonthRange } from "./shared/date-utils.js";
import type { ExportFile } from "./shared/types.js";
import {
    generateUUID,
    createEmptyUUIDMaps,
    type UUIDMaps,
} from "./shared/uuid-utils.js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

interface ImportOptions {
    userId: string;
    files: string[];
    clearExisting: boolean;
}

async function parseArgs(): Promise<ImportOptions> {
    const args = process.argv.slice(2);
    let userId: string | undefined;
    let filesArg: string | undefined;
    let clearExisting = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--userId=")) {
            userId = arg.split("=")[1];
        } else if (arg.startsWith("--files=")) {
            filesArg = arg.split("=")[1];
        } else if (arg === "--clearExisting") {
            clearExisting = true;
        }
    }

    if (!userId || !filesArg) {
        console.error(`
Usage: npm run import-data -- --userId=<uuid> --files=<file.json> [--clearExisting]

Example:
  # Import to a new user (default - no clearing needed)
  npm run import-data -- --userId="019a8a84-c7aa-750b-8d12-ab3618e219a4" --files="user-data.json"

  # Import to existing user and clear their data first
  npm run import-data -- --userId="019a8a84-c7aa-750b-8d12-ab3618e219a4" --files="user-data.json" --clearExisting

Parameters:
  --userId         Target user UUID to import data into
  --files          JSON export file to import
  --clearExisting  (Optional) Clear existing user data before import
        `);
        process.exit(1);
    }

    const files = filesArg.split(",").map((f) => f.trim());

    return { userId, files, clearExisting };
}

async function clearMonthData(userId: string, month: string): Promise<number> {
    console.log(`  • Clearing existing data for month ${month}...`);
    const { start: monthStart, end: monthEnd } = getMonthRange(month);

    let deletedCount = 0;

    // Delete in reverse dependency order

    // First, find materials in this month (we'll need this for transactions)
    const materialsInMonth = await db
        .select({ id: materialAndSupply.id })
        .from(materialAndSupply)
        .where(
            and(
                eq(materialAndSupply.userId, userId),
                gte(materialAndSupply.createdAt, monthStart),
                lte(materialAndSupply.createdAt, monthEnd),
            ),
        );

    // 13. Material Inventory Transactions (delete before materials)
    if (materialsInMonth.length > 0) {
        for (const material of materialsInMonth) {
            await db
                .delete(materialInventoryTransaction)
                .where(
                    eq(materialInventoryTransaction.materialId, material.id),
                );
        }
    }

    // 12. Operational Expenses
    const deletedOpExpenses = await db
        .delete(operational_expense)
        .where(
            and(
                eq(operational_expense.user_id, userId),
                gte(operational_expense.createdAt, monthStart),
                lte(operational_expense.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedOpExpenses.length || 0;

    // 11. Studio Overhead Expenses
    const deletedStudioExpenses = await db
        .delete(studio_overhead_expense)
        .where(
            and(
                eq(studio_overhead_expense.user_id, userId),
                gte(studio_overhead_expense.createdAt, monthStart),
                lte(studio_overhead_expense.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedStudioExpenses.length || 0;

    // 10. Sale Details (cascade from sales)
    const salesInMonth = await db
        .select({ id: sale.id })
        .from(sale)
        .where(
            and(
                eq(sale.userId, userId),
                gte(sale.date, monthStart),
                lte(sale.date, monthEnd),
            ),
        );

    if (salesInMonth.length > 0) {
        for (const s of salesInMonth) {
            await db.delete(saleDetail).where(eq(saleDetail.saleId, s.id));
        }
    }

    // 9. Sales
    const deletedSales = await db
        .delete(sale)
        .where(
            and(
                eq(sale.userId, userId),
                gte(sale.date, monthStart),
                lte(sale.date, monthEnd),
            ),
        );
    deletedCount += deletedSales.length || 0;

    // 8. Production Batches (need to find via goods)
    const goodsInMonth = await db
        .select({ id: good.id })
        .from(good)
        .where(
            and(
                eq(good.userId, userId),
                gte(good.createdAt, monthStart),
                lte(good.createdAt, monthEnd),
            ),
        );

    if (goodsInMonth.length > 0) {
        for (const g of goodsInMonth) {
            await db
                .delete(productionBatch)
                .where(eq(productionBatch.goodId, g.id));
        }
    }

    // 7. Good to Material Output Ratio junction table
    if (goodsInMonth.length > 0) {
        for (const g of goodsInMonth) {
            await db
                .delete(goodToMaterialOutputRatio)
                .where(eq(goodToMaterialOutputRatio.goodId, g.id));
        }
    }

    // 6. Material Output Ratios (delete before materials since they reference materials)
    if (materialsInMonth.length > 0) {
        for (const material of materialsInMonth) {
            await db
                .delete(materialOutputRatio)
                .where(eq(materialOutputRatio.materialId, material.id));
        }
    }

    // 5. Goods
    const deletedGoods = await db
        .delete(good)
        .where(
            and(
                eq(good.userId, userId),
                gte(good.createdAt, monthStart),
                lte(good.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedGoods.length || 0;

    // 4. Materials and Supplies
    const deletedMaterials = await db
        .delete(materialAndSupply)
        .where(
            and(
                eq(materialAndSupply.userId, userId),
                gte(materialAndSupply.createdAt, monthStart),
                lte(materialAndSupply.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedMaterials.length || 0;

    // 3. User Preferences
    const deletedPrefs = await db
        .delete(userPreference)
        .where(
            and(
                eq(userPreference.userId, userId),
                gte(userPreference.createdAt, monthStart),
                lte(userPreference.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedPrefs.length || 0;

    // 2. Material Types
    const deletedMaterialTypes = await db
        .delete(materialType)
        .where(
            and(
                eq(materialType.userId, userId),
                gte(materialType.createdAt, monthStart),
                lte(materialType.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedMaterialTypes.length || 0;

    // 1. Product Types
    const deletedProductTypes = await db
        .delete(productType)
        .where(
            and(
                eq(productType.userId, userId),
                gte(productType.createdAt, monthStart),
                lte(productType.createdAt, monthEnd),
            ),
        );
    deletedCount += deletedProductTypes.length || 0;

    console.log(`    - Deleted ${deletedCount} existing records`);
    return deletedCount;
}

async function importFile(
    filePath: string,
    targetUserId: string,
    options: ImportOptions,
): Promise<number> {
    const fullPath = resolve(process.cwd(), filePath);

    // Validate file exists
    if (!existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }

    // Read and parse JSON
    const fileContent = readFileSync(fullPath, "utf-8");
    const exportData: ExportFile = JSON.parse(fileContent);

    const { metadata, userData } = exportData;

    console.log(`\nImporting ${filePath} (month: ${metadata.month})...`);
    console.log(`  • Source user: ${metadata.sourceUserId}`);
    console.log(`  • Records to import: ${metadata.recordCount}`);

    // Step 1: Optionally clear existing data
    if (options.clearExisting && metadata.month !== "ALL") {
        await clearMonthData(targetUserId, metadata.month);
    } else if (options.clearExisting && metadata.month === "ALL") {
        console.log(
            `  ⚠ Skipping clear (month is "ALL" - cannot determine what to clear)`,
        );
        console.log(
            `    If you need to clear, please do so manually before import`,
        );
    } else {
        console.log(
            `  • Skipping data clearing (--clearExisting not specified)`,
        );
    }

    // Step 2: Generate UUID mappings
    console.log(`  • Generating UUID mappings...`);
    const uuidMaps: UUIDMaps = createEmptyUUIDMaps();

    let importedCount = 0;

    // Step 3: Import in dependency order

    // 3.1: Product Types
    if (userData.productTypes.length > 0) {
        console.log(
            `  • Importing ${userData.productTypes.length} product types...`,
        );
        for (const pt of userData.productTypes) {
            const newId = generateUUID();
            uuidMaps.productTypes.set(pt.id, newId);

            await db.insert(productType).values({
                id: newId,
                name: pt.name,
                userId: targetUserId,
                createdAt: new Date(pt.createdAt),
                updatedAt: new Date(pt.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.2: Material Types
    if (userData.materialTypes.length > 0) {
        console.log(
            `  • Importing ${userData.materialTypes.length} material types...`,
        );
        for (const mt of userData.materialTypes) {
            const newId = generateUUID();
            uuidMaps.materialTypes.set(mt.id, newId);

            await db.insert(materialType).values({
                id: newId,
                name: mt.name,
                userId: targetUserId,
                createdAt: new Date(mt.createdAt),
                updatedAt: new Date(mt.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.3: User Preference (delete existing and replace with imported one)
    if (userData.userPreference) {
        console.log(`  • Importing 1 user preference...`);
        const pref = userData.userPreference;
        const newId = generateUUID();
        uuidMaps.userPreferences.set(pref.id, newId);

        // Delete any existing userPreference for this user
        await db
            .delete(userPreference)
            .where(eq(userPreference.userId, targetUserId));

        // Insert the new preference
        await db.insert(userPreference).values({
            id: newId,
            userId: targetUserId,
            productTypeIds: [], // Ignore as per requirements
            profitPercentage: pref.profitPercentage,
            estimatedMonthlyOperatingExpenses:
                pref.estimatedMonthlyOperatingExpenses,
            estimatedMonthlyProducedUnits: pref.estimatedMonthlyProducedUnits,
            operatingCostPercentage: pref.operatingCostPercentage,
            laborCost: pref.laborCost,
            overheadCostPercentage: pref.overheadCostPercentage,
            lowInventoryAlertForGoods: pref.lowInventoryAlertForGoods,
            lowInventoryAlertForMaterials: pref.lowInventoryAlertForMaterials,
            hasCompletedSetup: pref.hasCompletedSetup,
            createdAt: new Date(pref.createdAt),
            updatedAt: new Date(pref.updatedAt),
        });
        importedCount++;
    }

    // 3.4: Materials and Supplies
    if (userData.materialAndSupply.length > 0) {
        console.log(
            `  • Importing ${userData.materialAndSupply.length} materials and supplies...`,
        );
        for (const material of userData.materialAndSupply) {
            const newId = generateUUID();
            uuidMaps.materials.set(material.id, newId);

            const newMaterialTypeId =
                uuidMaps.materialTypes.get(material.materialTypeId) ||
                material.materialTypeId;

            await db.insert(materialAndSupply).values({
                id: newId,
                userId: targetUserId,
                name: material.name,
                materialTypeId: newMaterialTypeId,
                unitId: material.unitId, // Reference data, keep as is
                quantity: material.quantity,
                purchasePrice: material.purchasePrice,
                purchaseQuantity: material.purchaseQuantity,
                costPerUnit: material.costPerUnit,
                lastPurchaseDate: material.lastPurchaseDate,
                supplier: material.supplier,
                supplierUrl: material.supplierUrl,
                notes: material.notes,
                threshold: material.threshold,
                createdAt: new Date(material.createdAt),
                updatedAt: new Date(material.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.5: Goods
    if (userData.goods.length > 0) {
        console.log(`  • Importing ${userData.goods.length} goods...`);
        for (const g of userData.goods) {
            const newId = generateUUID();
            uuidMaps.goods.set(g.id, newId);

            const newProductTypeId = g.productTypeId
                ? uuidMaps.productTypes.get(g.productTypeId) || g.productTypeId
                : null;

            await db.insert(good).values({
                id: newId,
                userId: targetUserId,
                name: g.name,
                productTypeId: newProductTypeId,
                image: null, // Skip image as per requirements
                retailPrice: g.retailPrice,
                note: g.note,
                inventoryQuantity: g.inventoryQuantity,
                producedQuantity: g.producedQuantity,
                materialCost: g.materialCost,
                overheadCost: g.overheadCost,
                laborCost: g.laborCost,
                operatingCost: g.operatingCost,
                netProfit: g.netProfit,
                minimumStockLevel: g.minimumStockLevel,
                createdAt: new Date(g.createdAt),
                updatedAt: new Date(g.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.6: Material Output Ratios
    if (userData.materialOutputRatios.length > 0) {
        console.log(
            `  • Importing ${userData.materialOutputRatios.length} material output ratios...`,
        );
        for (const ratio of userData.materialOutputRatios) {
            const newId = generateUUID();
            uuidMaps.materialOutputRatios.set(ratio.id, newId);

            const newMaterialId =
                uuidMaps.materials.get(ratio.materialId) || ratio.materialId;

            await db.insert(materialOutputRatio).values({
                id: newId,
                materialId: newMaterialId,
                input: ratio.input,
                createdAt: new Date(ratio.createdAt),
                updatedAt: new Date(ratio.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.7: Good to Material Output Ratio junction table
    if (userData.goodToMaterialOutputRatios.length > 0) {
        console.log(
            `  • Importing ${userData.goodToMaterialOutputRatios.length} good-to-ratio mappings...`,
        );
        for (const mapping of userData.goodToMaterialOutputRatios) {
            const newGoodId =
                uuidMaps.goods.get(mapping.goodId) || mapping.goodId;
            const newRatioId =
                uuidMaps.materialOutputRatios.get(
                    mapping.materialOutputRatioId,
                ) || mapping.materialOutputRatioId;

            await db.insert(goodToMaterialOutputRatio).values({
                goodId: newGoodId,
                materialOutputRatioId: newRatioId,
            });
            importedCount++;
        }
    }

    // 3.8: Production Batches
    if (userData.productionBatches.length > 0) {
        console.log(
            `  • Importing ${userData.productionBatches.length} production batches...`,
        );
        for (const batch of userData.productionBatches) {
            const newId = generateUUID();
            uuidMaps.productionBatches.set(batch.id, newId);

            const newGoodId = uuidMaps.goods.get(batch.goodId) || batch.goodId;

            await db.insert(productionBatch).values({
                id: newId,
                goodId: newGoodId,
                productionDate: batch.productionDate,
                statusId: batch.statusId, // Reference data, keep as is
                quantity: batch.quantity,
                productionCost: batch.productionCost,
                notes: batch.notes,
                createdAt: new Date(batch.createdAt),
                updatedAt: new Date(batch.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.9: Sales
    if (userData.sales.length > 0) {
        console.log(`  • Importing ${userData.sales.length} sales...`);
        for (const s of userData.sales) {
            const newId = generateUUID();
            uuidMaps.sales.set(s.id, newId);

            await db.insert(sale).values({
                id: newId,
                userId: targetUserId,
                customer: s.customer,
                salesNumber: s.salesNumber, // Preserve original as per requirements
                channelId: s.channelId, // Reference data, keep as is
                date: new Date(s.date),
                statusId: s.statusId, // Reference data, keep as is
                note: s.note,
                discount: s.discount,
                shippingFee: s.shippingFee,
                taxPercentage: s.taxPercentage,
                totalPrice: s.totalPrice,
                cogs: s.cogs,
                profit: s.profit,
                createdAt: new Date(s.createdAt),
                updatedAt: new Date(s.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.10: Sale Details
    if (userData.saleDetails.length > 0) {
        console.log(
            `  • Importing ${userData.saleDetails.length} sale details...`,
        );
        for (const detail of userData.saleDetails) {
            const newId = generateUUID();
            uuidMaps.saleDetails.set(detail.id, newId);

            const newSaleId =
                uuidMaps.sales.get(detail.saleId) || detail.saleId;
            const newGoodId =
                uuidMaps.goods.get(detail.goodId) || detail.goodId;

            await db.insert(saleDetail).values({
                id: newId,
                saleId: newSaleId,
                goodId: newGoodId,
                quantity: detail.quantity,
                pricePerItem: detail.pricePerItem,
                cogs: detail.cogs,
                createdAt: new Date(detail.createdAt),
                updatedAt: new Date(detail.updatedAt),
            });
            importedCount++;
        }
    }

    // 3.11: Studio Overhead Expenses
    if (userData.studioOverheadExpenses.length > 0) {
        console.log(
            `  • Importing ${userData.studioOverheadExpenses.length} studio overhead expenses...`,
        );
        for (const expense of userData.studioOverheadExpenses) {
            const newId = generateUUID();
            uuidMaps.studioExpenses.set(expense.id, newId);

            await db.insert(studio_overhead_expense).values({
                id: newId,
                expense_type: expense.expense_type,
                user_id: targetUserId,
                name: expense.name,
                cost: expense.cost,
                payee: expense.payee,
                payment_method: expense.payment_method,
                notes: expense.notes || "", // Use empty string if null
                attach_recipt: "", // Skip file as per requirements (empty string for NOT NULL)
                createdAt: new Date(expense.createdAt),
                repeat_every: expense.repeat_every,
                start_date: expense.start_date
                    ? new Date(expense.start_date)
                    : null,
                due_date: expense.due_date ? new Date(expense.due_date) : null,
            });
            importedCount++;
        }
    }

    // 3.12: Operational Expenses
    if (userData.operationalExpenses.length > 0) {
        console.log(
            `  • Importing ${userData.operationalExpenses.length} operational expenses...`,
        );
        for (const expense of userData.operationalExpenses) {
            const newId = generateUUID();
            uuidMaps.operationalExpenses.set(expense.id, newId);

            const newGoodId = expense.good_id
                ? uuidMaps.goods.get(expense.good_id) || expense.good_id
                : null;
            const newMaterialId = expense.materialAndSupply_id
                ? uuidMaps.materials.get(expense.materialAndSupply_id) ||
                  expense.materialAndSupply_id
                : null;

            await db.insert(operational_expense).values({
                id: newId,
                expense_type: expense.expense_type,
                user_id: targetUserId,
                name: expense.name,
                cost: expense.cost,
                payee: expense.payee,
                payment_method: expense.payment_method,
                good_id: newGoodId,
                materialAndSupply_id: newMaterialId,
                quantity: expense.quantity,
                notes: expense.notes || "", // Use empty string if null
                attach_recipt: "", // Skip file as per requirements (empty string for NOT NULL)
                createdAt: new Date(expense.createdAt),
                repeat_every: expense.repeat_every,
                start_date: expense.start_date
                    ? new Date(expense.start_date)
                    : null,
                due_date: expense.due_date ? new Date(expense.due_date) : null,
            });
            importedCount++;
        }
    }

    // 3.13: Material Inventory Transactions
    if (userData.materialInventoryTransactions.length > 0) {
        console.log(
            `  • Importing ${userData.materialInventoryTransactions.length} material inventory transactions...`,
        );
        for (const transaction of userData.materialInventoryTransactions) {
            const newId = generateUUID();
            uuidMaps.inventoryTransactions.set(transaction.id, newId);

            const newMaterialId =
                uuidMaps.materials.get(transaction.materialId) ||
                transaction.materialId;

            await db.insert(materialInventoryTransaction).values({
                id: newId,
                materialId: newMaterialId,
                userId: targetUserId,
                quantityChange: transaction.quantityChange,
                quantityBefore: transaction.quantityBefore,
                quantityAfter: transaction.quantityAfter,
                createdAt: new Date(transaction.createdAt),
            });
            importedCount++;
        }
    }

    console.log(
        `  ✓ Successfully imported ${importedCount} records from ${filePath}\n`,
    );
    return importedCount;
}

async function importUserData(options: ImportOptions): Promise<void> {
    const startTime = Date.now();
    console.log("• Starting data import operation...\n");

    // Step 1: Validation
    console.log("✓ Validating inputs...");
    await validateUserExists(options.userId);

    console.log(`✓ Loading ${options.files.length} file(s)...\n`);

    // Step 2: Import each file
    let totalImported = 0;
    for (const file of options.files) {
        const imported = await importFile(file, options.userId, options);
        totalImported += imported;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
        `✓ Successfully imported ${totalImported} total records across ${options.files.length} file(s)`,
    );
    console.log(`✓ Operation complete (${duration}s total)\n`);
}

// Main execution
parseArgs()
    .then((options) => importUserData(options))
    .then(() => {
        console.log("Import completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n✗ Import failed:");
        console.error(error.message);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    });
