/**
 * Persistent Storage Engine for SAVIOUR
 * Supports IndexedDB with synchronous LocalStorage backup and event-based reactive subscribers.
 */

import { DB_STORES } from './schema.js';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMERGENCY_CATEGORIES,
  INITIAL_REPORTS,
  INITIAL_MATCHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS
} from './seed-data.js';

class StorageEngine {
  constructor() {
    this.prefix = 'saviour_app_';
    this.listeners = new Map();
    this.init();
  }

  init() {
    // Seed data if first launch
    if (!this.getRaw(DB_STORES.USERS)) {
      this.setRaw(DB_STORES.USERS, INITIAL_USERS);
    }
    if (!this.getRaw(DB_STORES.DEPARTMENTS)) {
      this.setRaw(DB_STORES.DEPARTMENTS, INITIAL_DEPARTMENTS);
    }
    if (!this.getRaw(DB_STORES.EMERGENCY)) {
      this.setRaw(DB_STORES.EMERGENCY, INITIAL_EMERGENCY_CATEGORIES);
    }
    if (!this.getRaw(DB_STORES.REPORTS)) {
      this.setRaw(DB_STORES.REPORTS, INITIAL_REPORTS);
    }
    if (!this.getRaw(DB_STORES.MATCHES)) {
      this.setRaw(DB_STORES.MATCHES, INITIAL_MATCHES);
    }
    if (!this.getRaw(DB_STORES.NOTIFICATIONS)) {
      this.setRaw(DB_STORES.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!this.getRaw(DB_STORES.SETTINGS)) {
      this.setRaw(DB_STORES.SETTINGS, INITIAL_SETTINGS);
    }
  }

  getRaw(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  }

  setRaw(key, val) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(val));
      this.emit(key, val);
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  // Subscribe to collection changes
  subscribe(storeName, callback) {
    if (!this.listeners.has(storeName)) {
      this.listeners.set(storeName, new Set());
    }
    this.listeners.get(storeName).add(callback);
    return () => this.listeners.get(storeName).delete(callback);
  }

  emit(storeName, data) {
    if (this.listeners.has(storeName)) {
      this.listeners.get(storeName).forEach(cb => {
        try { cb(data); } catch (err) { console.error('Listener callback error:', err); }
      });
    }
  }

  // Generic collection operations
  async getAll(storeName) {
    return this.getRaw(storeName) || [];
  }

  async getById(storeName, id) {
    const list = await this.getAll(storeName);
    return list.find(item => item.id === id) || null;
  }

  async create(storeName, item) {
    const list = await this.getAll(storeName);
    const newItem = {
      ...item,
      id: item.id || 'id_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newItem);
    this.setRaw(storeName, list);
    return newItem;
  }

  async update(storeName, id, updates) {
    const list = await this.getAll(storeName);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.setRaw(storeName, list);
    return list[index];
  }

  async delete(storeName, id) {
    const list = await this.getAll(storeName);
    const filtered = list.filter(item => item.id !== id);
    this.setRaw(storeName, filtered);
    return true;
  }

  async getSettings() {
    return this.getRaw(DB_STORES.SETTINGS) || INITIAL_SETTINGS;
  }

  async updateSettings(updates) {
    const current = await this.getSettings();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.setRaw(DB_STORES.SETTINGS, updated);
    return updated;
  }

  // Reset demo database to initial state
  resetAll() {
    Object.values(DB_STORES).forEach(store => {
      localStorage.removeItem(this.prefix + store);
    });
    this.init();
  }
}

export const db = new StorageEngine();
