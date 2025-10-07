import {
    boolean,
    date,
    integer,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
    productTypeIds: uuid("product_type_ids")
        .array()
        .notNull()
        .references(() => productType.id),
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
    expenseType: integer("adminExpenseType_id")
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

export const goods = pgTable("goods", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    // TODO: ASK, if product type is modified or deleted, how should it be hundled?
    productTypeId: uuid("puroduct_type_id").references(() => productType.id),
    image: text("image"),
    retailPrice: numeric("retail_price"),
    size: text("size"),
    color: text("color"),
    productionDate: date("production_date"),
    note: text("note"),
    soldQuantity: integer("sold_quantity").default(0),
    tags: uuid("tags_id").array(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const productType = pgTable("product_type", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const sales = pgTable("sales", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    channelId: uuid("channel_id")
        .notNull()
        .references(() => channel.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    good: uuid("good")
        .notNull()
        .references(() => goods.id),
    quantity: integer("quantity").notNull(),
    totalPrice: numeric("total_price").notNull(),
    profit: numeric("profit"),
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

export const materialAndSupply = pgTable("material_and_supply", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    unitId: uuid("unit_id")
        .references(() => unit.id)
        .notNull(),
    purchasePrice: numeric("purchase_price").notNull(),
    costPerUnit: numeric("cost_per_unit"),
    quantity: integer("quantity").notNull(),
    threshold: integer("threshold"),
    supplier: text("supplier").notNull(),
    purchaseDate: date("purchase_date").defaultNow(),
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

export const productMaterialUsed = pgTable("product_material_used", {
    id: uuid("id").primaryKey(),
    goodsId: uuid("goods_id")
        .references(() => goods.id)
        .notNull(),
    materialAndSupplyId: uuid("material_and_supply_id")
        .references(() => materialAndSupply.id)
        .notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Define relation of materialAndSupply to productMaterialUsed (one-to-many)
export const materialAndSupplyToProductMaterialUsed = relations(
    materialAndSupply,
    ({ many }) => ({
        productMaterialsUsed: many(productMaterialUsed),
    }),
);

// Define relation of goods to productMaterialUsed (one-to-many)
export const goodsToProductMaterialUsed = relations(goods, ({ many }) => ({
    productMaterialsUsed: many(productMaterialUsed),
}));

export const notifications = pgTable("notifications", {
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

// Define relation of auth user to notifications (one-to-many)
export const userToNotifications = relations(user, ({ many }) => ({
    notifications: many(notifications),
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
