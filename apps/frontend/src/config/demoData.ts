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

type DemoDataConfig = {
    goods: GoodsDemoData;
    materials: MaterialsDemoData;
    sales: SalesDemoData;
    businessExpense: BusinessExpenseDemoData;
    signup: SignupDemoData;
};

export const demoData: DemoDataConfig = {
    // TODO - To be updated when data for presentation is finalized
    goods: {
        name: "Santa Speckled Mug",
        productType: "Mugs",
        inventoryQuantity: 50,
        minimumStockLevel: 10,
        retailPrice: 44.99,
        note: "Hand-molded and painted speckled ceramic mug with Santa Claus design.",
        image: "/demo/product-demo.webp",
        materials: [
            {
                name: "Mayco Fundamentals - Flame Red",
                amount: 10,
            },
            {
                name: "Mayco Fundamentals - China White",
                amount: 10,
            },
            {
                name: "Georgies Pioneer Dark w/ Speckles ",
                amount: 0.45,
            },
            {
                name: "Tuckers Satin Clear Glaze",
                amount: 40,
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
        notes: "Zinc-free glossy transparent glaze. Great for use over underglaze or on its own.",
    },

    sales: {
        customer: "Pinkaew N.",
        channel: "Instagram",
        salesDate: "today",
        products: [
            { name: "Speckled Cup", quantity: 1 },
            { name: "Terra Plate", quantity: 1 },
        ],
        status: "In-Progress",
        notes: "Repeat customer with special discount.",
        discount: 5,
        shipping: 6,
        tax: 12,
    },

    businessExpense: {
        date: "today",
        expenseType: "Miscellaneous",
        name: "Community Membership",
        cost: 10,
        payee: "Indie Ceramics Community",
        notes: "Monthly membership",
        recurring: true,
    },

    signup: {
        email: `lya${Math.floor(10000 + Math.random() * 90000)}@arvo.com`,
        name: "Lya Artist",
        password: "password",
    },
};
