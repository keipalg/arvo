import {
    boolean,
    date,
    integer,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
    check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
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

export const adminExpenseType = pgTable("adminExpenseType", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const adminExpense = pgTable("adminExpense", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    expenseType: uuid("adminExpenseType_id")
        .notNull()
        .references(() => adminExpenseType.id),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Define relation of auth user to AdminExpense (one-to-many)
export const userToAdminExpense = relations(user, ({ many }) => ({
    adminExpenses: many(adminExpense),
}));

export const good = pgTable("good", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    productTypeId: uuid("product_type_id").references(() => productType.id),
    image: text("image"),
    retailPrice: numeric("retail_price").notNull(),
    note: text("note"),
    inventoryQuantity: integer("inventory_quantity").default(0),
    collectionTags: uuid("collection_tags_id")
        .array()
        .references(() => collectionTag.id),
    producedQuantity: integer("produced_quantity"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    materialOutputRatioId: uuid("material_output_ratio_id")
        .array()
        .references(() => materialOutputRatio.id),
    productionExpensesRatioId: uuid("production_expense_ratio_id")
        .array()
        .references(() => productionExpensesRatio.id),
});

export const productionBatch = pgTable("production_batch", {
    id: uuid("id").primaryKey(),
    goodId: uuid("good_id")
        .notNull()
        .references(() => good.id, { onDelete: "cascade" }),
    productionDate: timestamp("production_date", {
        withTimezone: true,
    }).notNull(),
    batchRecipeId: uuid("batch_recipe_id")
        .array()
        .references(() => batchRecipe.id),
    productionExpensesId: uuid("production_expense_id")
        .array()
        .references(() => productionExpense.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const batchRecipe = pgTable("batch_recipe", {
    id: uuid("id").primaryKey(),
    materialId: uuid("material_id")
        .references(() => materialAndSupply.id)
        .notNull(),
    usageAmount: numeric("usage_amount"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const productionExpense = pgTable(
    "production_expense",
    {
        id: uuid("id").primaryKey(),
        type: text("type").notNull(),
        cost: integer("cost").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        check("type_allowed_values", sql`${table.type} IN ('labor', 'rent')`),
    ],
);

export const materialOutputRatio = pgTable("material_output_ratio", {
    id: uuid("id").primaryKey(),
    materialId: uuid("material_id")
        .references(() => materialAndSupply.id)
        .notNull(),
    input: numeric("input").notNull(),
    output: integer("output").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const productionExpensesRatio = pgTable(
    "production_expense_ratio",
    {
        id: uuid("id").primaryKey(),
        type: text("type").notNull(),
        cost: integer("cost").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        check("type_allowed_values", sql`${table.type} IN ('labor', 'rent')`),
    ],
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const materialType = pgTable("material_type", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
});

export const materialAndSupply = pgTable("material_and_supply", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    materialTypeId: uuid("material_type_id")
        .references(() => materialType.id)
        .notNull(),
    unitId: uuid("unit_id")
        .references(() => unit.id)
        .notNull(),
    quantity: integer("quantity").notNull(),
    purchasePrice: numeric("purchase_price").notNull(),
    lastPurchaseDate: date("last_purchase_date"),
    supplier: text("supplier").notNull(),
    notes: text("notes"),
    threshold: integer("threshold"),
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
