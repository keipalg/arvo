import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../src/db/client.js";
import { notificationType } from "../src/db/schema.js";
import { NOTIFICATION_TYPES } from "../src/utils/constants/notificationTypes.js";

const setupNotificationTypes = async () => {
    console.log("Seeding notification types...");

    const notificationTypesData = [
        {
            id: uuidv7(),
            key: NOTIFICATION_TYPES.PRODUCT_LOW_INVENTORY,
            name: "Product Low Inventory",
        },
        {
            id: uuidv7(),
            key: NOTIFICATION_TYPES.MATERIAL_LOW_INVENTORY,
            name: "Material Low Inventory",
        },
    ];

    for (const typeData of notificationTypesData) {
        // Check if notification type already exists
        const existing = await db
            .select()
            .from(notificationType)
            .where(eq(notificationType.key, typeData.key))
            .limit(1);

        if (existing.length === 0) {
            await db.insert(notificationType).values(typeData);
            console.log(`Inserted notification type: ${typeData.name}`);
        } else {
            console.log(
                `Notification type already exists: ${typeData.name}, skipping...`,
            );
        }
    }

    console.log("Notification types setup complete.");
};

setupNotificationTypes()
    .then(() => {
        console.log("Setup completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error setting up notification types:", error);
        process.exit(1);
    });
