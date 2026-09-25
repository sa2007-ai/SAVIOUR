/**
 * Role-Based Access Control (RBAC) Helper
 */

import { auth } from './auth-service.js';
import { ROLES } from '../db/schema.js';

export const rbac = {
  canAccessAdmin() {
    return auth.isLoggedIn() && auth.isAdmin();
  },

  canAccessStudent() {
    return auth.isLoggedIn() && auth.isStudent();
  },

  canReportInfrastructure(user) {
    // For demo purposes, allow student or CR
    return auth.isStudent() || auth.isAdmin();
  },

  enforceStudent() {
    if (!this.canAccessStudent()) {
      throw new Error('Access denied: Student account required.');
    }
  },

  enforceAdmin() {
    if (!this.canAccessAdmin()) {
      throw new Error('Access denied: Administrator privileges required.');
    }
  }
};
