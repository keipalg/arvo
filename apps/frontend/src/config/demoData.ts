/**
 * Demo data configuration for development autofill
 * Only used when NODE_ENV=development
 *
 * Shortcut key: Ctrl+Shift+0 (or Cmd+Shift+0 on Mac)
 */

type GoodsDemoData = {
    name?: string;
    productType?: string;
    inventoryQuantity?: number;
    minimumStockLevel?: number;
    retailPrice?: number;
    note?: string;
    image?: string;
    materials?: Array<{ name: string; amount: number }>;
};

type MaterialsDemoData = {
    name?: string;
    materialType?: string;
    quantity?: number;
    unit?: string;
    purchasePrice?: number;
    supplier?: string;
    supplierUrl?: string;
    minStockLevel?: number;
    notes?: string;
};

type SalesDemoData = {
    customer?: string;
    channel?: string;
    salesDate?: string;
    products?: Array<{ name: string; quantity: number }>;
    status?: string;
    notes?: string;
    discount?: number;
    shipping?: number;
    tax?: number;
};

type BusinessExpenseDemoData = {
    date?: string;
    expenseType?: string;
    name?: string;
    cost?: number;
    payee?: string;
    notes?: string;
    recurring?: boolean;
};

type SignupDemoData = {
    email?: string;
    name?: string;
    password?: string;
};

type OperatingCostDemoData = {
    estimatedMonthlyOperatingExpenses?: number;
    estimatedMonthlyProducedUnits?: number;
};

type ProductTypesDemoData = {
    productTypes?: string[];
};

type MaterialTypesDemoData = {
    materialTypes?: string[];
};

type ProductionBatchDemoData = {
    productionDate?: string;
    productName?: string;
    quantity?: number;
    notes?: string;
};

type DemoDataConfig = {
    goods: GoodsDemoData;
    materials: MaterialsDemoData;
    sales: SalesDemoData;
    businessExpense: BusinessExpenseDemoData;
    signup: SignupDemoData;
    operatingCost: OperatingCostDemoData;
    productTypes: ProductTypesDemoData;
    materialTypes: MaterialTypesDemoData;
    productionBatch: ProductionBatchDemoData;
};

export const demoData: DemoDataConfig = {
    goods: {
        name: "Gingerbread Man Mug",
        productType: "Mugs",
        inventoryQuantity: 50,
        minimumStockLevel: 10,
        retailPrice: 44.99,
        note: "Holiday special.",
        image: "/demo/product-demo.webp",
        materials: [
            {
                name: "Tuckers Mid Cal 5", // Clay
                amount: 0.45,
            },
            {
                name: "Coyote Cinnamon Stick Glaze", // Glaze
                amount: 25,
            },

            {
                name: "Mayco Fundamentals - Spice Brown", // Underglaze
                amount: 8,
            },
        ],
    },

    materials: {
        name: "Tuckers Porcelain Clear Glossy Dry Glaze",
        materialType: "Glossy Dry Glaze",
        quantity: 1000,
        unit: "milliliter",
        purchasePrice: 20.85,
        supplier: "The Clay Warehouse",
        supplierUrl: "https://theclaywarehouse.ca/pages/supplies",
        minStockLevel: 250,
    },

    sales: {
        customer: "Kanta N.",
        channel: "Instagram",
        salesDate: "today",
        products: [
            { name: "Pastel Ring Tray Blue", quantity: 1 },
            { name: "Speckled Latte Cup", quantity: 1 },
        ],
        status: "In-Progress",
        notes: "Repeat customer with special discount.",
        discount: 5,
        shipping: 6,
        tax: 12,
    },

    businessExpense: {
        date: "today",
        expenseType: "Packaging Supplies",
        name: "Holiday Packaging Supplies",
        cost: 10,
        payee: "Dollarama",
        notes: "Additional packaging supplies to Christmas season.",
        recurring: false,
    },

    signup: {
        email: `lya${Math.floor(10000 + Math.random() * 90000)}@artist.com`,
        name: "Lya Artist",
        password: "password",
    },

    operatingCost: {
        estimatedMonthlyOperatingExpenses: 400,
        estimatedMonthlyProducedUnits: 40,
    },

    productTypes: {
        productTypes: ["Bowls", "Plates", "Vases", "Soap Dishes"],
    },

    materialTypes: {
        materialTypes: [
            "Stoneware Clay",
            "Clear Glaze",
            "Underglaze",
            "Porcelain Clay",
        ],
    },

    productionBatch: {
        productionDate: "today",
        productName: "Gingerbread Man Mug",
        quantity: 5,
        notes: "Holiday batch",
    },
};
