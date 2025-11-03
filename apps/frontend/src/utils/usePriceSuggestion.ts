import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../utils/trpcClient";

interface PriceSuggestionInput {
    productType: string;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    operationalCost: number;
    profitMarginPreference: number;
    // salesChannel: string;
}

interface PriceSuggestion {
    suggestedPrice: number;
    priceRange: { min: number; max: number };
    reasoning: string;
    marketInsights: string;
}

export const usePriceSuggestion = () => {
    const cacheRef = useRef<Map<string, PriceSuggestion>>(new Map());
    const mutation = useMutation(
        trpc.priceSuggestion.suggest.mutationOptions(),
    );

    const getCacheKey = (input: PriceSuggestionInput) => {
        return JSON.stringify(input);
    };

    const getSuggestion = async (
        input: PriceSuggestionInput,
    ): Promise<PriceSuggestion | null> => {
        const cacheKey = getCacheKey(input);

        if (cacheRef.current.has(cacheKey)) {
            return cacheRef.current.get(cacheKey) || null;
        }

        try {
            const result = await mutation.mutateAsync(input);
            cacheRef.current.set(cacheKey, result);
            console.log(result);
            return result;
        } catch {
            return null;
        }
    };

    return {
        getSuggestion,
        isLoading: mutation.isPending,
        error: mutation.error,
    };
};
