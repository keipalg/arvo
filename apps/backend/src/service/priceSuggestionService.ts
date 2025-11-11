import { openai } from "../utils/openaiClient.js";
import { db } from "../db/client.js";
import { priceSuggestionCache } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

interface PriceSuggestionInput {
    productType: string;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    operationalCost: number;
    profitMarginPreference: number;
    // salesChannel: string;
}

export interface PriceSuggestion {
    suggestedPrice: number;
    priceRange: { min: number; max: number };
}

const generateInputHash = (input: PriceSuggestionInput): string => {
    const normalized = {
        productType: input.productType.toLowerCase().trim(),
        materialCost: Math.round(input.materialCost * 100) / 100,
        laborCost: Math.round(input.laborCost * 100) / 100,
        overheadCost: Math.round(input.overheadCost * 100) / 100,
        operationalCost: Math.round(input.operationalCost * 100) / 100,
        profitMarginPreference:
            Math.round(input.profitMarginPreference * 100) / 100,
        // salesChannel:,
    };
    return crypto
        .createHash("md5")
        .update(JSON.stringify(normalized))
        .digest("hex");
};

export const generatePriceSuggestion = async (
    input: PriceSuggestionInput,
    userId: string,
): Promise<PriceSuggestion> => {
    const inputHash = generateInputHash(input);

    // Check cache
    const cached = await db
        .select()
        .from(priceSuggestionCache)
        .where(eq(priceSuggestionCache.inputHash, inputHash))
        .limit(1);

    if (cached.length > 0) {
        const result = cached[0];
        return {
            suggestedPrice: result.suggestedPrice,
            priceRange: {
                min: result.priceRangeMin,
                max: result.priceRangeMax,
            },
        };
    }

    // Generate new suggestion
    const totalCost =
        input.materialCost +
        input.laborCost +
        input.overheadCost +
        input.operationalCost;
    console.log(totalCost);

    const prompt = `As a handcraft business pricing expert especially for ceramic artist, suggest a competitive price for:

Product Type: ${input.productType}
Material Cost: $${input.materialCost}
Labor Cost: $${input.laborCost}
Overhead Cost: $${input.overheadCost}
Operational Cost: $${input.operationalCost}
Total Cost: $${totalCost}
Desired Profit Margin: ${input.profitMarginPreference}%
Competitors: similar product on Etsy(https://www.etsy.com/ca?utm_source=google&utm_medium=cpc&utm_term=etsy_e&utm_campaign=Search_CA_Brand_GGL_ENG_General-Brand_Core_All_Exact&utm_ag=A1&utm_custom1=_k_Cj0KCQjwgpzIBhCOARIsABZm7vGmYsLlku-yw9JsQJKdOUY938JqJsMJ5wDAngGT3p0IlTCpDAMc8xsaAhM9EALw_wcB_k_&utm_content=go_1463443864_59403767200_542583523663_kwd-1818581752_c_&utm_custom2=1463443864&gad_source=1&gad_campaignid=1463443864&gbraid=0AAAAADutTMfJbm5DzzhE7mzkkdFjMvr7O&gclid=Cj0KCQjwgpzIBhCOARIsABZm7vGmYsLlku-yw9JsQJKdOUY938JqJsMJ5wDAngGT3p0IlTCpDAMc8xsaAhM9EALw_wcB)

Search and consider competitor pricing for this season and sales chanel Eatsy or Amazon. Respond in JSON format:
{
  "suggestedPrice": number,
  "priceRange": {"min": number, "max": number},
  "reasoning": "brief explanation including seasonal and channel factors",
  "marketInsights": "seasonal and channel-specific market context"
}`;

    const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [{ role: "user", content: prompt }],
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
    });

    console.log(response);
    const suggestion = JSON.parse(response.output_text || "{}");

    // Cache the result
    await db.insert(priceSuggestionCache).values({
        id: crypto.randomUUID(),
        userId,
        inputHash,
        suggestedPrice: suggestion.suggestedPrice,
        priceRangeMin: suggestion.priceRange.min,
        priceRangeMax: suggestion.priceRange.max,
    });

    return suggestion;
};
