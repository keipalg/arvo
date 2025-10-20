import { v7 as uuidv7 } from "uuid";
import { db } from "../src/db/client.js";
import { unit } from "../src/db/schema.js";

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

const setupMaterialsDefaults = async () => {
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

setupMaterialsDefaults();
