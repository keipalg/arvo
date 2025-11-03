import { z } from "zod";
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
} from "../service/notificationsService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const notificationRouter = router({
    list: protectedProcedure
        .input(
            z.object({
                page: z.number().default(1),
                limit: z.number().default(10),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await getNotifications(ctx.user.id, input.page, input.limit);
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
