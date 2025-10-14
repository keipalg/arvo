import { getStatusList } from "../service/statusService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const statusRouter = router({
    list: protectedProcedure.query(async () => {
        return await getStatusList();
    }),
});
