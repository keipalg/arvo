import { getChannelList } from "../service/channelService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const channelRouter = router({
    list: protectedProcedure.query(async () => {
        return await getChannelList();
    }),
});
