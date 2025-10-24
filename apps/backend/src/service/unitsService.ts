import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { unit } from "../db/schema.js";

export const getUnitList = async () => {
    return await db
        .select({
            id: unit.id,
            cat: unit.category,
            name: unit.name,
            abv: unit.abbreviation,
        })
        .from(unit);
};

export const getUnitById = async (id: string) => {
    return await db.query.unit.findFirst({
        where: eq(unit.id, id),
    });
};

export const getUnitByName = async (name: string) => {
    return await db.query.unit.findFirst({
        where: eq(unit.name, name),
    });
};
