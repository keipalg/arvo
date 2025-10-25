import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { user } from "../src/auth/auth-schema.js";
import { db } from "../src/db/client.js";
import { materialType, unit } from "../src/db/schema.js";

console.log("Setting up initial materials data...");
const unitsOfMeasure = [
    {
        name: "pounds",
        abbreviation: "lbs",
        category: "weight",
    },
    {
        name: "kilograms",
        abbreviation: "kg",
        category: "weight",
    },
    {
        name: "grams",
        abbreviation: "g",
        category: "weight",
    },
    {
        name: "milligrams",
        abbreviation: "mg",
        category: "weight",
    },
    {
        name: "carats",
        abbreviation: "ct",
        category: "weight",
    },
    {
        name: "grains",
        abbreviation: "gr",
        category: "weight",
    },
    {
        name: "ounces",
        abbreviation: "oz",
        category: "weight",
    },
    {
        name: "gallons",
        abbreviation: "gal",
        category: "volume",
    },
    {
        name: "liters",
        abbreviation: "L",
        category: "volume",
    },
    {
        name: "milliliters",
        abbreviation: "mL",
        category: "volume",
    },
    {
        name: "quarts",
        abbreviation: "qt",
        category: "volume",
    },
    {
        name: "pints",
        abbreviation: "pt",
        category: "volume",
    },
    {
        name: "inches",
        abbreviation: "in",
        category: "length",
    },
    {
        name: "feet",
        abbreviation: "ft",
        category: "length",
    },
    {
        name: "yards",
        abbreviation: "yd",
        category: "length",
    },
    {
        name: "meters",
        abbreviation: "m",
        category: "length",
    },
    {
        name: "centimeters",
        abbreviation: "cm",
        category: "length",
    },
    {
        name: "millimeters",
        abbreviation: "mm",
        category: "length",
    },
    {
        name: "pieces",
        abbreviation: "pcs",
        category: "quantity",
    },
    {
        name: "each",
        abbreviation: "ea",
        category: "quantity",
    },
    {
        name: "dozen",
        abbreviation: "doz",
        category: "quantity",
    },
    {
        name: "boxes",
        abbreviation: "box",
        category: "quantity",
    },
    {
        name: "bags",
        abbreviation: "bag",
        category: "quantity",
    },
];

const setupUnits = async () => {
    await Promise.all(
        unitsOfMeasure.map((unitOfMeasure) =>
            db.insert(unit).values({
                id: uuidv7(),
                name: unitOfMeasure.name,
                abbreviation: unitOfMeasure.abbreviation,
                category: unitOfMeasure.category,
            }),
        ),
    );

    console.log("Initial data setup for materials complete.");
};

const sampleUserEmail = "test@mylangara.ca";
const userId = (
    await db
        .select({
            id: user.id,
        })
        .from(user)
        .where(eq(user.email, sampleUserEmail))
        .limit(1)
)[0].id;

console.log(`Setting up initial material types for user ${sampleUserEmail}...`);

const materialTypes = [
    "Porcelain Clay",
    "Stoneware Clay",
    "Earthenware Clay",
    "Ball Clay",
    "Clear Glaze",
    "Matte White Glaze",
    "Underglaze",
    "Slip",
    "Stain",
    "Oxide",
    "Frit",
];

const setupMaterialTypesForUser = async () => {
    await Promise.all(
        materialTypes.map((type) =>
            db.insert(materialType).values({
                id: uuidv7(),
                userId: userId,
                name: type,
            }),
        ),
    );
    console.log(`Material types setup complete for user ${sampleUserEmail}.`);
    return;
};

setupUnits();
setupMaterialTypesForUser();
