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
    goodToMaterialOutputRatio,
    productionBatch,
    sale,
    saleDetail,
    studio_overhead_expense,
    operational_expense,
    materialInventoryTransaction,
    unit,
    status,
    channel,
    productionStatus,
    notificationType,
} from "../../src/db/schema.js";
import { validateUserExists } from "./shared/validation.js";
import type { ExportFile, ExportMetadata } from "./shared/types.js";
import { writeFileSync } from "fs";
import { resolve } from "path";

interface ExportOptions {
    userId: string;
    outputFile: string;
}

async function parseArgs(): Promise<ExportOptions> {
    const args = process.argv.slice(2);
    let userId: string | undefined;
    let outputFile: string | undefined;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--userId=")) {
            userId = arg.split("=")[1];
        } else if (arg.startsWith("--output=")) {
            outputFile = arg.split("=")[1];
        }
    }

    if (!userId || !outputFile) {
        console.error(`
Usage: npm run export-data -- --userId=<uuid> --output=<filename>

Example:
  npm run export-data -- --userId="019a8a84-c7aa-750b-8d12-ab3618e219a4" --output="user-data.json"

Parameters:
  --userId    User UUID to export ALL data for
  --output    Output filename (e.g., "user-data.json")

Note: This exports ALL data for the user across all months (not filtered by month)
        `);
        process.exit(1);
    }

    return { userId, outputFile };
}

async function exportUserData(options: ExportOptions): Promise<void> {
    const startTime = Date.now();
    console.log("• Starting data export operation...\n");

    // Step 1: Validation
    console.log("✓ Validating user...");
    await validateUserExists(options.userId);
    console.log();

    // Step 2: Export reference data (shared across all users)
    console.log("• Exporting reference data...");
    const [units, statuses, channels, productionStatuses, notificationTypes] =
        await Promise.all([
            db.select().from(unit),
            db.select().from(status),
            db.select().from(channel),
            db.select().from(productionStatus),
            db.select().from(notificationType),
        ]);

    console.log(`  - Exported ${units.length} units`);
    console.log(`  - Exported ${statuses.length} statuses`);
    console.log(`  - Exported ${channels.length} channels`);
    console.log(
        `  - Exported ${productionStatuses.length} production statuses`,
    );
    console.log(
        `  - Exported ${notificationTypes.length} notification types\n`,
    );

    // Step 3: Export ALL user-specific data (across all months)
    console.log(`• Exporting ALL data for user ${options.userId}...\n`);

    let totalRecords = 0;

    // 3.1: Product Types
    const productTypes = await db
        .select()
        .from(productType)
        .where(eq(productType.userId, options.userId));
    console.log(`  ✓ Exported ${productTypes.length} product types`);
    totalRecords += productTypes.length;

    // 3.2: Material Types
    const materialTypes = await db
        .select()
        .from(materialType)
        .where(eq(materialType.userId, options.userId));
    console.log(`  ✓ Exported ${materialTypes.length} material types`);
    totalRecords += materialTypes.length;

    // 3.3: User Preference
    const userPreferences = await db
        .select()
        .from(userPreference)
        .where(eq(userPreference.userId, options.userId));
    const userPref = userPreferences.length > 0 ? userPreferences[0] : null;
    if (userPref) {
        console.log(`  ✓ Exported 1 user preference`);
        totalRecords += 1;
    }

    // 3.4: Materials and Supplies
    const materials = await db
        .select()
        .from(materialAndSupply)
        .where(eq(materialAndSupply.userId, options.userId));
    console.log(`  ✓ Exported ${materials.length} materials and supplies`);
    totalRecords += materials.length;

    // 3.5: Goods
    const goods = await db
        .select()
        .from(good)
        .where(eq(good.userId, options.userId));
    console.log(`  ✓ Exported ${goods.length} goods`);
    totalRecords += goods.length;

    // 3.6: Material Output Ratios (get all for the exported goods)
    const goodIds = goods.map((g) => g.id);
    let materialOutputRatios: any[] = [];
    let goodToMaterialOutputRatios: any[] = [];

    if (goodIds.length > 0) {
        // Get junction table entries for ALL goods
        goodToMaterialOutputRatios = await db
            .select()
            .from(goodToMaterialOutputRatio)
            .where(inArray(goodToMaterialOutputRatio.goodId, goodIds));

        // Get all material output ratios related to these goods
        const ratioIds = goodToMaterialOutputRatios.map(
            (r) => r.materialOutputRatioId,
        );
        if (ratioIds.length > 0) {
            materialOutputRatios = await db
                .select()
                .from(materialOutputRatio)
                .where(inArray(materialOutputRatio.id, ratioIds));
        }
    }
    console.log(
        `  ✓ Exported ${materialOutputRatios.length} material output ratios`,
    );
    console.log(
        `  ✓ Exported ${goodToMaterialOutputRatios.length} good-to-ratio mappings`,
    );
    totalRecords +=
        materialOutputRatios.length + goodToMaterialOutputRatios.length;

    // 3.7: Production Batches (filter by user's goods)
    let userProductionBatches: any[] = [];
    if (goodIds.length > 0) {
        const productionBatches = await db
            .select()
            .from(productionBatch)
            .where(inArray(productionBatch.goodId, goodIds));
        userProductionBatches = productionBatches;
    }
    console.log(
        `  ✓ Exported ${userProductionBatches.length} production batches`,
    );
    totalRecords += userProductionBatches.length;

    // 3.8: Sales
    const sales = await db
        .select()
        .from(sale)
        .where(eq(sale.userId, options.userId));
    console.log(`  ✓ Exported ${sales.length} sales`);
    totalRecords += sales.length;

    // 3.9: Sale Details
    const saleIds = sales.map((s) => s.id);
    let saleDetails: any[] = [];
    if (saleIds.length > 0) {
        saleDetails = await db
            .select()
            .from(saleDetail)
            .where(inArray(saleDetail.saleId, saleIds));
    }
    console.log(`  ✓ Exported ${saleDetails.length} sale details`);
    totalRecords += saleDetails.length;

    // 3.10: Studio Overhead Expenses
    const studioExpenses = await db
        .select()
        .from(studio_overhead_expense)
        .where(eq(studio_overhead_expense.user_id, options.userId));
    console.log(
        `  ✓ Exported ${studioExpenses.length} studio overhead expenses`,
    );
    totalRecords += studioExpenses.length;

    // 3.11: Operational Expenses
    const operationalExpenses = await db
        .select()
        .from(operational_expense)
        .where(eq(operational_expense.user_id, options.userId));
    console.log(
        `  ✓ Exported ${operationalExpenses.length} operational expenses`,
    );
    totalRecords += operationalExpenses.length;

    // 3.12: Material Inventory Transactions
    const materialIds = materials.map((m) => m.id);
    let inventoryTransactions: any[] = [];
    if (materialIds.length > 0) {
        inventoryTransactions = await db
            .select()
            .from(materialInventoryTransaction)
            .where(
                inArray(materialInventoryTransaction.materialId, materialIds),
            );
    }
    console.log(
        `  ✓ Exported ${inventoryTransactions.length} material inventory transactions`,
    );
    totalRecords += inventoryTransactions.length;

    // Step 4: Build export file structure
    console.log("\n• Building export file structure...");

    const metadata: ExportMetadata = {
        exportedAt: new Date().toISOString(),
        sourceUserId: options.userId,
        month: "ALL", // Export includes all months
        recordCount: totalRecords,
        version: "1.0",
    };

    const exportData: ExportFile = {
        metadata,
        referenceData: {
            units,
            statuses,
            channels,
            productionStatuses,
            notificationTypes,
        },
        userData: {
            productTypes,
            materialTypes,
            userPreference: userPref,
            materialAndSupply: materials,
            goods,
            materialOutputRatios,
            goodToMaterialOutputRatios,
            productionBatches: userProductionBatches,
            sales,
            saleDetails,
            studioOverheadExpenses: studioExpenses,
            operationalExpenses,
            materialInventoryTransactions: inventoryTransactions,
        },
    };

    // Step 5: Write to file
    const outputPath = resolve(process.cwd(), options.outputFile);
    const jsonContent = JSON.stringify(exportData, null, 2);
    const fileSizeKB = (jsonContent.length / 1024).toFixed(2);

    writeFileSync(outputPath, jsonContent, "utf-8");

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✓ Total records exported: ${totalRecords}`);
    console.log(`✓ Saved to: ${outputPath} (${fileSizeKB} KB)`);
    console.log(`✓ Operation complete (${duration}s total)\n`);
}

// Main execution
parseArgs()
    .then((options) => exportUserData(options))
    .then(() => {
        console.log("Export completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n✗ Export failed:");
        console.error(error.message);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    });
