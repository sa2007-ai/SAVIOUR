/**
 * In-App Notification Service for SAVIOUR
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES } from '../db/schema.js';
import { auth } from '../auth/auth-service.js';

class NotificationService {
  async getUserNotifications() {
    const user = auth.getCurrentUser();
    if (!user) return [];
    const all = await db.getAll(DB_STORES.NOTIFICATIONS);
    return all.filter(n => n.userId === user.id);
  }

  async getUnreadCount() {
    const list = await this.getUserNotifications();
    return list.filter(n => !n.read).length;
  }

  async markAsRead(id) {
    return db.update(DB_STORES.NOTIFICATIONS, id, { read: true });
  }

  async markAllAsRead() {
    const list = await this.getUserNotifications();
    for (const item of list) {
      if (!item.read) {
        await db.update(DB_STORES.NOTIFICATIONS, item.id, { read: true });
      }
    }
  }

  async sendNotification({ userId, title, message, type = 'INFO', relatedReportId = null }) {
    return db.create(DB_STORES.NOTIFICATIONS, {
      userId,
      title,
      message,
      type,
      read: false,
      relatedReportId
    });
  }
}

export const notificationService = new NotificationService();
