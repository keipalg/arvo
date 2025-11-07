import { and, count, desc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/client.js";
import {
    notification,
    notificationType,
    userPreference,
} from "../db/schema.js";
import { NOTIFICATION_TYPES } from "../utils/constants/notificationTypes.js";

/**
 * Private helper to insert notification into database
 */
const _insertNotification = async (
    userId: string,
    typeId: string,
    title: string,
    message: string,
) => {
    const notifiedAt = new Date();

    await db
        .insert(notification)
        .values({
            id: uuidv7(),
            userId,
            type_id: typeId,
            title,
            message,
            notifiedAt,
            isRead: false,
        })
        .returning({
            id: notification.id,
        });
};

/**
 * Private help to get notification type ID by key
 */
const _getNotificationTypeId = async (key: string): Promise<string> => {
    const result = await db
        .select({ id: notificationType.id })
        .from(notificationType)
        .where(eq(notificationType.key, key))
        .limit(1);

    if (!result[0]) {
        throw new Error(`Notification type with key ${key} not found`);
    }

    return result[0].id;
};

/**
 * Create product low inventory notification
 * @param userId user ID
 * @param productName name of the product
 * @param remainingQuantity remaining quantity
 */
export const createProductLowInventoryNotification = async (
    userId: string,
    productName: string,
    remainingQuantity: number,
) => {
    const preferences = await db
        .select({
            lowInventoryAlertForGoods: userPreference.lowInventoryAlertForGoods,
        })
        .from(userPreference)
        .where(eq(userPreference.userId, userId))
        .limit(1);

    if (preferences[0] && !preferences[0].lowInventoryAlertForGoods) {
        return; // Off - Don't send product notification
    }

    const typeId = await _getNotificationTypeId(
        NOTIFICATION_TYPES.PRODUCT_LOW_INVENTORY,
    );

    const title = `Low Stock: ${productName}`;
    const message = `There are only ${remainingQuantity} ${productName} left. Time to plan a new batch.`;

    await _insertNotification(userId, typeId, title, message);
};

/**
 * Create material low inventory notification
 * @param userId user ID
 * @param materialType type of material
 * @param materialName name of the material
 * @param minimumStockLevel minimum stock level
 * @param unitAbv units of measurement
 */
export const createMaterialLowInventoryNotification = async (
    userId: string,
    materialType: string,
    materialName: string,
    minimumStockLevel: number,
    unitAbv: string,
) => {
    const preferences = await db
        .select({
            lowInventoryAlertForMaterials:
                userPreference.lowInventoryAlertForMaterials,
        })
        .from(userPreference)
        .where(eq(userPreference.userId, userId))
        .limit(1);

    if (preferences[0] && !preferences[0].lowInventoryAlertForMaterials) {
        return; // Off - Don't send material notification
    }

    const typeId = await _getNotificationTypeId(
        NOTIFICATION_TYPES.MATERIAL_LOW_INVENTORY,
    );

    const title = `Low Material: ${materialType}`;
    const message = `Time to restock! Your ${materialName} has reached ${minimumStockLevel} ${unitAbv}.`;

    await _insertNotification(userId, typeId, title, message);
};

/**
 * Get all notifications for user
 * For notifications tray
 * @param userId user ID
 * @param page optional page (defaults to 1)
 * @param limit optional limit (defaults to 10)
 * @returns list of notifications
 */
export const getNotifications = async (
    userId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const offset = (page - 1) * limit;

    const notifications = await db
        .select({
            id: notification.id,
            userId: notification.userId,
            type_id: notification.type_id,
            title: notification.title,
            message: notification.message,
            notifiedAt: notification.notifiedAt,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            typeKey: notificationType.key,
        })
        .from(notification)
        .leftJoin(
            notificationType,
            eq(notification.type_id, notificationType.id),
        )
        .where(eq(notification.userId, userId))
        .orderBy(desc(notification.notifiedAt))
        .limit(limit)
        .offset(offset);

    return notifications;
};

/**
 * Get unread count of notifications
 * For notification icon at header
 * @param userId user ID
 * @returns count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
    const result = await db
        .select({ count: count() })
        .from(notification)
        .where(
            and(
                eq(notification.userId, userId),
                eq(notification.isRead, false),
            ),
        );

    return result[0]?.count || 0;
};

/**
 * Update a notification row isRead to true unless specified false
 * For notifications tray feature
 * @param notificationId notificaiton ID
 * @param isRead optional (defaults to true)
 */
export const markAsRead = async (
    notificationId: string,
    isRead: boolean = true,
) => {
    await db
        .update(notification)
        .set({ isRead })
        .where(eq(notification.id, notificationId));
};

/**
 * Mark all notification of user to read
 * For notifications tray feature
 * @param userId user ID
 * @returns query result of udpate
 */
export const markAllAsRead = async (userId: string) => {
    const result = await db
        .update(notification)
        .set({ isRead: true })
        .where(
            and(
                eq(notification.userId, userId),
                eq(notification.isRead, false),
            ),
        );

    return result;
};
