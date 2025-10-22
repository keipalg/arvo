import { relations, sql } from "drizzle-orm";
import {
    boolean,
    check,
    date,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth/auth-schema.ts";

export const sampleTable = pgTable("sample", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
});

export const userPreference = pgTable("user_preference", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    productTypeIds: uuid("product_type_ids").array().notNull(),
    profitPercentage: numeric("profit_percentage", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    operatingCostPercentage: numeric("operating_cost_percentage", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    laborCost: numeric("labor_cost", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Define relation of auth user to user preference (one-to-one)
export const userToUserPreference = relations(user, ({ one }) => ({
    userPreference: one(userPreference, {
        fields: [user.id],
        references: [userPreference.userId],
    }),
}));

/* Operational Expense */
export const payment_method_enum = pgEnum("payment_method", ["credit", "cash"]);
export const operational_expense_type_enum = pgEnum(
    "operational_expense_type",
    [
        "marketing",
        "business_fee",
        "utilities",
        "office_supplies",
        "studio_rent",
        "labor",
        "storage_fee",
        "inventory_loss",
        "miscellaneous",
    ],
);

export const operational_expense = pgTable(
    "operational_expense",
    {
        id: uuid("id").primaryKey(),
        expense_type: operational_expense_type_enum("expense_type"),
        user_id: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name"),
        cost: numeric("cost"),
        payee: text("payee"),
        payment_method: payment_method_enum("payment_method"),
        good_id: uuid("good_id").references(() => good.id, {
            onDelete: "cascade",
        }),
        materialAndSupply_id: uuid("materialAndSupply_id").references(
            () => materialAndSupply.id,
            {
                onDelete: "cascade",
            },
        ),
        quantity: numeric("quantity"),
        notes: text("notes"),
        attach_recipt: text("attach_recipt"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        start_date: timestamp("start_date"),
        due_date: timestamp("due_date"),
    },
    (t) => ({
        inventory_loss_check: check(
            "inventory_loss_check",
            sql`
				(${t.expense_type} <> 'inventory_loss')
				OR (
					(${t.good_id} IS NOT NULL AND ${t.materialAndSupply_id} IS NULL AND ${t.quantity} IS NOT NULL)
					OR
					(${t.good_id} IS NULL AND ${t.materialAndSupply_id} IS NOT NULL AND ${t.quantity} IS NOT NULL)
				)
			`,
        ),
        other_type_check: check(
            "other_type_check",
            sql`
				(${t.expense_type} = 'inventory_loss')
				OR (${t.name} IS NOT NULL AND ${t.cost} IS NOT NULL AND ${t.payee} IS NOT NULL AND ${t.payment_method} IS NOT NULL)
			`,
        ),
    }),
);

/* Studio Overhead Expense */
export const studio_overhead_expense_type_enum = pgEnum(
    "studio_overhead_expense_type_enum",
    ["tools_equipment", "packaging_supplies", "miscellaneous"],
);

export const studio_overhead_expense = pgTable("studio_overhead_expense", {
    id: uuid("id").primaryKey(),
    expense_type: studio_overhead_expense_type_enum("expense_type"),
    user_id: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cost: numeric("cost").notNull(),
    payee: text("payee").notNull(),
    payment_method: payment_method_enum("payment_method"),
    notes: text("notes"),
    attach_recipt: text("attach_recipt"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relation of auth user to Expense (one-to-many)
export const userToExpense = relations(user, ({ many }) => ({
    operational_expense: many(operational_expense),
    studio_overhead_expense: many(studio_overhead_expense),
}));

export const good = pgTable("good", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    productTypeId: uuid("product_type_id").references(() => productType.id),
    image: text("image"),
    retailPrice: numeric("retail_price", {
        precision: 12,
        scale: 2,
        mode: "number",
    }).notNull(),
    note: text("note"),
    inventoryQuantity: integer("inventory_quantity").default(0),
    producedQuantity: integer("produced_quantity").default(0),
    materialCost: numeric("material_cost", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    orverheadCost: numeric("orverhead_cost", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    laborCost: numeric("labor_cost", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    operatingCost: numeric("operating_cost", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    netProfit: numeric("net_profit", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    minimumStockLevel: integer("minimum_stock_level"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const productionBatch = pgTable("production_batch", {
    id: uuid("id").primaryKey(),
    goodId: uuid("good_id")
        .notNull()
        .references(() => good.id, { onDelete: "cascade" }),
    productionDate: timestamp("production_date", {
        withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Define relation of good to production batch (one-to-many)
export const goodToProductionBatch = relations(good, ({ many }) => ({
    productionBatch: many(productionBatch),
}));

export const batchRecipe = pgTable("batch_recipe", {
    id: uuid("id").primaryKey(),
    materialId: uuid("material_id")
        .references(() => materialAndSupply.id)
        .notNull(),
    usageAmount: numeric("usage_amount", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const productionBatchToBatchRecipe = pgTable(
    "production_batch_to_batch_recipe",
    {
        productionBatchId: uuid("production_batch_id")
            .notNull()
            .references(() => productionBatch.id, { onDelete: "cascade" }),
        batchRecipeId: uuid("batch_recipe_id")
            .notNull()
            .references(() => batchRecipe.id, { onDelete: "cascade" }),
    },
);

export const materialOutputRatio = pgTable("material_output_ratio", {
    id: uuid("id").primaryKey(),
    materialId: uuid("material_id")
        .references(() => materialAndSupply.id)
        .notNull(),
    input: numeric("input", {
        precision: 12,
        scale: 2,
        mode: "number",
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const goodToMaterialOutputRatio = pgTable(
    "good_to_material_output_ratio",
    {
        goodId: uuid("good_id")
            .notNull()
            .references(() => good.id, { onDelete: "cascade" }),
        materialOutputRatioId: uuid("material_output_ratio_id")
            .notNull()
            .references(() => materialOutputRatio.id, { onDelete: "cascade" }),
    },
);

export const productType = pgTable("product_type", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const collectionTag = pgTable("collection_tag", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const goodToCollectionTag = pgTable("good_to_collection_tag", {
    goodId: uuid("good_id")
        .notNull()
        .references(() => good.id, { onDelete: "cascade" }),
    collectionTagId: uuid("collection_tag_id")
        .notNull()
        .references(() => collectionTag.id, { onDelete: "cascade" }),
});

export const sale = pgTable("sale", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    customer: text("customer").notNull(),
    salesNumber: integer("sales_number").notNull(),
    channelId: uuid("channel_id")
        .notNull()
        .references(() => channel.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    statusId: uuid("status_id")
        .notNull()
        .references(() => status.id, { onDelete: "cascade" }),
    note: text("note"),
    discount: numeric("discount").default("0").notNull(),
    shippingFee: numeric("shipping_fee").default("0").notNull(),
    taxPercentage: numeric("tax_percentage").default("0").notNull(),
    totalPrice: numeric("total_price").notNull(),
    profit: numeric("profit"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const saleDetail = pgTable("sale_detail", {
    id: uuid("id").primaryKey(),
    saleId: uuid("sale_id")
        .notNull()
        .references(() => sale.id, { onDelete: "cascade" }),
    goodId: uuid("good_id")
        .notNull()
        .references(() => good.id),
    quantity: integer("quantity").notNull(),
    pricePerItem: numeric("price_per_item").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const status = pgTable("status", {
    id: uuid("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const channel = pgTable("channel", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const unit = pgTable("unit", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    abbreviation: text("abbreviation").notNull(),
    category: text("category").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const materialAndSupply = pgTable("material_and_supply", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    materialType: text("material_type").notNull(),
    unitId: uuid("unit_id")
        .references(() => unit.id)
        .notNull(),
    quantity: numeric("quantity", {
        precision: 12,
        scale: 2,
        mode: "number",
    }).notNull(),
    purchasePrice: numeric("purchase_price", {
        precision: 12,
        scale: 2,
        mode: "number",
    }).notNull(),
    costPerUnit: numeric("cost_per_unit", {
        precision: 12,
        scale: 2,
        mode: "number",
    }).notNull(),
    lastPurchaseDate: date("last_purchase_date").notNull(),
    supplier: text("supplier"),
    notes: text("notes"),
    threshold: numeric("threshold", {
        precision: 12,
        scale: 2,
        mode: "number",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const materialAndSupplyToUnit = relations(
    materialAndSupply,
    ({ one }) => ({
        unit: one(unit, {
            fields: [materialAndSupply.unitId],
            references: [unit.id],
        }),
    }),
);

export const notification = pgTable("notification", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    type: uuid("type")
        .notNull()
        .references(() => notificationType.id),
    notifiedAt: timestamp("notified_at").defaultNow().notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Define relation of auth user to notification (one-to-many)
export const userToNotification = relations(user, ({ many }) => ({
    notification: many(notification),
}));

export const notificationType = pgTable("notification_type", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Define relation of goods and materialAndSupply to InventoryLoss (one-to-many)
export const goodsToInventoryLoss = relations(good, ({ many }) => ({
    operational_expense: many(operational_expense),
}));

export const materialAndSupplyToInventoryLoss = relations(
    materialAndSupply,
    ({ many }) => ({
        operational_expense: many(operational_expense),
    }),
);
