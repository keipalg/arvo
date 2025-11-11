import { openai } from "../utils/openaiClient.js";

type RevenueProfitSummary = {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
};

export const generateRevenueProfitSummaryOverview = async ({
    totalRevenue,
    totalExpenses,
    totalProfit,
}: RevenueProfitSummary) => {
    const prompt = `Generate a concise overview based on the following data:
        Total Revenue: $${totalRevenue.toFixed(2)}
        Total Expenses: $${totalExpenses.toFixed(2)}
        Total Profit: $${totalProfit.toFixed(2)}
    `;
    return String(await generateDashboardOverview(prompt));
};

export const generateDashboardOverview = async (prompt: string) => {
    const overview = `Generate a concise dashboard overview in 2, 3 sentences based on the following prompt: ${prompt}`;
    const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [{ role: "user", content: overview }],
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
    });

    return response.output_text;
};

// export const checkDashboarcOverviewCache = async () => {
//     c
//         .createHash("md5")
//         .update(JSON.stringify(normalized))
//         .digest("hex");
// }
