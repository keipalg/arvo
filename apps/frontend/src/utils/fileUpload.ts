import { trpcClient } from "./trpcClient";

export const uploadFile = async (file: File) => {
    const { uploadUrl, publicUrl } = await trpcClient.file.signedUrl.query();

    const res = await fetch(uploadUrl, {
        method: "PUT",
        mode: "cors",
        headers: {
            "Content-Type": "application/octet-stream",
        },
        body: file,
    });

    if (!res.ok) {
        throw new Error("File upload failed");
    }

    return publicUrl;
};
