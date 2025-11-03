import { z } from "zod";
import { protectedProcedure, router } from "./trpcBase.js";
import { generatePriceSuggestion } from "../service/priceSuggestionService.js";

export const priceSuggestionRouter = router({
    suggest: protectedProcedure
        .input(
            z.object({
                productType: z.string(),
                materialCost: z.number(),
                laborCost: z.number(),
                overheadCost: z.number(),
                operationalCost: z.number(),
                profitMarginPreference: z.number(),
                // salesChannel: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            return await generatePriceSuggestion(input, ctx.user.id);
        }),
});
