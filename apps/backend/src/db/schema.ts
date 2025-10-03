import {
    decimal,
    integer,
    pgTable,
    text,
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
    user_id: integer("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

// Define relation of auth user to AdminExpense (one-to-many)
export const userToAdminExpense = relations(user, ({ many }) => ({
    adminExpenses: many(adminExpense),
}));
