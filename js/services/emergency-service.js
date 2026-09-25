/**
 * Emergency & Quick Assistance Service for SAVIOUR
 * Manages touch-friendly emergency categories, direct calling, and admin configuration.
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES } from '../db/schema.js';

class EmergencyService {
  async getCategories(includeDisabled = false) {
    const list = await db.getAll(DB_STORES.EMERGENCY);
    const filtered = includeDisabled ? list : list.filter(c => c.enabled !== false);
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getCategoryById(id) {
    return db.getById(DB_STORES.EMERGENCY, id);
  }

  async createCategory(catData) {
    const list = await db.getAll(DB_STORES.EMERGENCY);
    const order = list.length + 1;
    return db.create(DB_STORES.EMERGENCY, {
      ...catData,
      order,
      enabled: true
    });
  }

  async updateCategory(id, updates) {
    return db.update(DB_STORES.EMERGENCY, id, updates);
  }

  async deleteCategory(id) {
    return db.delete(DB_STORES.EMERGENCY, id);
  }

  // Trigger Phone Call
  triggerCall(phone) {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  }

  // Trigger Direct Emergency Email
  triggerEmail(email, title) {
    if (!email) return;
    const subject = encodeURIComponent(`URGENT: Emergency Assistance Request — ${title}`);
    const body = encodeURIComponent(`I am in need of urgent assistance regarding: ${title}.\n\nPlease respond or contact me immediately.\n\nSent via SAVIOUR Emergency Help.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
}

export const emergencyService = new EmergencyService();
