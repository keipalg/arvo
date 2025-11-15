import { z } from "zod";
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
} from "../service/notificationsService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const notificationRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getNotifications(ctx.user.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
        return await getUnreadCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
        .input(
            z.object({
                notificationId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await markAsRead(input.notificationId);
        }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
        await markAllAsRead(ctx.user.id);
    }),
});
