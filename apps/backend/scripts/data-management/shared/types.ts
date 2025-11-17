export interface ExportMetadata {
    exportedAt: string;
    sourceUserId: string;
    month: string; // "YYYY-MM"
    recordCount: number;
    version: string;
}

export interface ExportFile {
    metadata: ExportMetadata;
    referenceData: {
        units: any[];
        statuses: any[];
        channels: any[];
        productionStatuses: any[];
        notificationTypes: any[];
    };
    userData: {
        productTypes: any[];
        materialTypes: any[];
        userPreference: any | null;
        materialAndSupply: any[];
        goods: any[];
        materialOutputRatios: any[];
        goodToMaterialOutputRatios: any[];
        productionBatches: any[];
        sales: any[];
        saleDetails: any[];
        studioOverheadExpenses: any[];
        operationalExpenses: any[];
        materialInventoryTransactions: any[];
    };
}
