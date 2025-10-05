import {
    decimal,
    integer,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    date,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/auth-schema.ts";
import { array, string } from "better-auth";

export const sampleTable = pgTable("sample", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
});

export const userPreference = pgTable("user_preference", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    // TODO update to relate to productTypes table when created
    // productTypeIds: uuid("product_type_ids").array().notNull(),
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
});

export const adminExpense = pgTable("adminExpense", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    expenseType: integer("adminExpenseType_id")
        .notNull()
        .references(() => adminExpenseType.id),
    cost: decimal("cost", { precision: 12, scale: 2 }).notNull(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

// Define relation of auth user to AdminExpense (one-to-many)
export const userToAdminExpense = relations(user, ({ many }) => ({
    adminExpenses: many(adminExpense),
}));

// Define size types
export const sizeEnum = pgEnum("size", ["small", "medium", "large"]);

export const goods = pgTable("goods", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 30 }).notNull(),
    description: varchar("description", { length: 100 }),
    // TODO: ASK, if product type is modified or deleted, how should it be hundled?
    productTypeID: uuid("puroduct_type_id").references(() => productType.id),
    image: text("image"),
    retailPrice: numeric("retail_price"),
    size: sizeEnum("size"),
    color: text("color"),
    // TODO: Considering by designers
    // firing
    productionDate: date("production_date"),
    note: varchar("note", { length: 100 }),
    soldQuantity: integer("sold_quantity").default(0),
    tags: uuid("tags_id").array(),
    quantity: integer("quantity").notNull(),
});

export const productType = pgTable("product_type", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 30 }).notNull(),
});

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 30 }).notNull(),
});

export const sales = pgTable("sales", {
    id: uuid("id").primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    channel_id: uuid("channel_id")
        .notNull()
        .references(() => channel.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    good: uuid("good")
        .notNull()
        .references(() => goods.id),
    quantity: integer("quantity").notNull(),
    total_price: decimal("total_price").notNull(),
    profit: decimal("profit"),
});

export const channel = pgTable("channel", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
});
