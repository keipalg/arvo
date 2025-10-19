import { db } from "../db/client.js";

export const getChannelList = async () => {
    return await db.query.channel.findMany({
        columns: {
            id: true,
            name: true,
        },
    });
};
