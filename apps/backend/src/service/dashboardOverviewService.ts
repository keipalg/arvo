import crypto from "crypto";
import { v7 as uuidv7 } from "uuid";
import { openai } from "../utils/openaiClient.js";
import { dashboardOverviewCache } from "../db/schema.js";
import { db } from "../db/client.js";
import { eq } from "drizzle-orm";

type RevenueProfitSummary = {
    userId: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
};

export const generateRevenueProfitSummaryOverview = async ({
    userId,
    totalRevenue,
    totalExpenses,
    totalProfit,
}: RevenueProfitSummary) => {
    const prompt = `Generate a concise overview based on the following data:
        Total Revenue: $${totalRevenue.toFixed(2)}
        Total Expenses: $${totalExpenses.toFixed(2)}
        Total Profit: $${totalProfit.toFixed(2)}
    `;

    let overview = await checkDashboardOverviewCache(userId, prompt);
    if (!overview) {
        overview = await generateDashboardOverview(prompt);
        await storeDashboardOverviewCache(userId, prompt, overview);
    }

    return overview;
};

type monthlyItem = {
    month: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
};
export const generateRevenueProfitSummary6MonthsOverview = async (
    userId: string,
    data: Array<monthlyItem>,
) => {
    const prompt = `Generate a concise overview based on the revenue and profit trends over the last 6 months:
        ${data.map(
            (item: any) =>
                `Month: ${item.month}, Revenue: $${item.totalRevenue.toFixed(2)}, Profit: $${item.totalProfit.toFixed(2)}`,
        )}
    `;

    let overview = await checkDashboardOverviewCache(userId, prompt);
    if (!overview) {
        overview = await generateDashboardOverview(prompt);
        await storeDashboardOverviewCache(userId, prompt, overview);
    }

    return overview;
};

export const generateProductionInOutOverview = async (
    userId: string,
    totalProduced: number,
    totalSold: number,
) => {
    const prompt = `Generate a concise overview based on the following production data:
        Total Produced Items: ${totalProduced}
        Total Sold Items: ${totalSold}
    `;

    let overview = await checkDashboardOverviewCache(userId, prompt);
    if (!overview) {
        overview = await generateDashboardOverview(prompt);
        await storeDashboardOverviewCache(userId, prompt, overview);
    }

    return overview;
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

const createDashboardOverviewCacheInputHash = (
    userId: string,
    prompt: string,
) => {
    const input = { userId, prompt };
    return crypto.createHash("md5").update(JSON.stringify(input)).digest("hex");
};

const selectDashboardOverviewCache = async (inputHash: string) => {
    const cached = await db
        .select()
        .from(dashboardOverviewCache)
        .where(eq(dashboardOverviewCache.inputHash, inputHash))
        .limit(1);

    if (cached.length > 0) {
        return cached[0].overview;
    }
    return null;
};

export const checkDashboardOverviewCache = async (
    userId: string,
    prompt: string,
) => {
    const inputHash = createDashboardOverviewCacheInputHash(userId, prompt);
    return await selectDashboardOverviewCache(inputHash);
};

export const storeDashboardOverviewCache = async (
    userId: string,
    prompt: string,
    overview: string,
) => {
    const inputHash = createDashboardOverviewCacheInputHash(userId, prompt);
    await db.insert(dashboardOverviewCache).values({
        id: uuidv7(),
        userId,
        inputHash,
        overview,
    });
};
