// import { eq } from "drizzle-orm";
// import { user } from "../src/auth/auth-schema.js";
// import { db } from "../src/db/client.js";
// import { channel, good, productType, sale, status } from "../src/db/schema.js";
// import { v7 as uuidv7 } from "uuid";

// const setupInitialData = async () => {
//     const sampleUserEmail = "test@mylangara.ca";
//     console.log("Setting up initial data...");

//     const userRes = await db
//         .select({
//             id: user.id,
//         })
//         .from(user)
//         .where(eq(user.email, sampleUserEmail))
//         .limit(1);

//     if (userRes.length === 0) {
//         console.log("Sample user not found.");
//         return;
//     }

//     const statusId = uuidv7();
//     await db.insert(status).values({
//         id: statusId,
//         key: "pending",
//         name: "Pending",
//     });

//     const channelId = uuidv7();
//     await db.insert(channel).values({
//         id: channelId,
//         name: "Etsy",
//     });

//     const productTypeId = uuidv7();
//     await db.insert(productType).values({
//         id: productTypeId,
//         name: "Mug",
//     });

//     const goodId = uuidv7();
//     await db.insert(good).values({
//         id: goodId,
//         userId: userRes[0].id,
//         name: "Sample Good",
//         productTypeId,
//         retailPrice: "10.00",
//     });

//     await db.insert(sale).values({
//         id: uuidv7(),
//         userId: userRes[0].id,
//         customer: "Sample Customer",
//         salesNumber: 1,
//         channelId,
//         date: new Date(),
//         statusId,
//         totalPrice: "100.0",
//         note: "Sample sale",
//         discount: "0",
//         shippingFee: "0",
//         taxPercentage: "0",
//     });

//     console.log("Initial data setup complete.");
// };

// setupInitialData();
