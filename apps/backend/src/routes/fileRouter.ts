import { Storage } from "@google-cloud/storage";
import { protectedProcedure, router } from "./trpcBase.js";

const bucketName = "arvo";
const storage = process.env.GCP_CREDENTIALS
    ? new Storage({ credentials: JSON.parse(process.env.GCP_CREDENTIALS) })
    : process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS })
      : new Storage();
const bucket = storage.bucket(bucketName);

export const fileRouter = router({
    signedUrl: protectedProcedure.query(async ({ ctx }) => {
        const fileName = `${ctx.user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const file = bucket.file(fileName);

        const [url] = await file.getSignedUrl({
            version: "v4",
            action: "write",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: "application/octet-stream",
        });

        return {
            uploadUrl: url,
            publicUrl: `https://storage.googleapis.com/${bucketName}/${fileName}`,
        };
    }),
});
