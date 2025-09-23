import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const sampleTable = pgTable("sample", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
});
