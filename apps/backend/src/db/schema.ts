import {
    decimal,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/auth-schema.js";

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

export const goods = pgTable("goods", {
    id: uuid("id").primaryKey(),
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
