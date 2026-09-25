/**
 * Authentication Service for SAVIOUR Platform
 * Enforces email prefix rules (Student '2...', Admin '3...'), secure password hashing, and session management.
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES, ROLES } from '../db/schema.js';

class AuthService {
  constructor() {
    this.sessionKey = 'saviour_active_session';
    this.currentUser = null;
    this.restoreSession();
  }

  // SHA-256 Hash with salt for secure password storage
  async hashPassword(password, salt = 'saviour_salt_campus_2026') {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Validate student email rule: MUST begin with '2'
  validateStudentEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    return /^2[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
  }

  // Validate admin email rule: MUST begin with '3'
  validateAdminEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    return /^3[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
  }

  restoreSession() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      if (session) {
        this.currentUser = JSON.parse(session);
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  saveSession(user) {
    // Never store passwordHash in active session
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      createdAt: user.createdAt
    };
    this.currentUser = safeUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(safeUser));
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === ROLES.ADMIN;
  }

  isStudent() {
    return this.currentUser && this.currentUser.role === ROLES.STUDENT;
  }

  // Student Registration
  async registerStudent({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      throw new Error('Please enter your full name.');
    }
    if (!this.validateStudentEmail(email)) {
      throw new Error('Student email must start with the digit "2" (e.g. 21student@college.edu).');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const users = await db.getAll(DB_STORES.USERS);
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this student email already exists.');
    }

    const passwordHash = await this.hashPassword(password);
    const newUser = await db.create(DB_STORES.USERS, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: ROLES.STUDENT,
      profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`
    });

    this.saveSession(newUser);
    return this.currentUser;
  }

  // Admin Registration
  async registerAdmin({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      throw new Error('Please enter administrator name.');
    }
    if (!this.validateAdminEmail(email)) {
      throw new Error('Admin official email must start with the digit "3" (e.g. 3001admin@college.edu).');
    }
    if (!password || password.length < 6) {
      throw new Error('Admin password must be at least 6 characters.');
    }

    const users = await db.getAll(DB_STORES.USERS);
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this administrator email already exists.');
    }

    const passwordHash = await this.hashPassword(password);
    const newUser = await db.create(DB_STORES.USERS, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: ROLES.ADMIN,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`
    });

    this.saveSession(newUser);
    return this.currentUser;
  }

  // Login (Dual Role Support)
  async login({ email, password, expectedRole }) {
    if (!email) throw new Error('Please enter your email address.');
    if (!password) throw new Error('Please enter your password.');

    const cleanEmail = email.trim().toLowerCase();

    // Check prefix rules strictly based on role
    if (expectedRole === ROLES.STUDENT) {
      if (!cleanEmail.startsWith('2')) {
        throw new Error('Student email addresses must start with the digit "2".');
      }
    } else if (expectedRole === ROLES.ADMIN) {
      if (!cleanEmail.startsWith('3')) {
        throw new Error('Administrator email addresses must start with the digit "3".');
      }
    }

    const users = await db.getAll(DB_STORES.USERS);
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    // Role check
    if (expectedRole && user.role !== expectedRole) {
      throw new Error(`This account is not registered as an ${expectedRole}.`);
    }

    const passwordHash = await this.hashPassword(password);
    // Allow demo seed users password matching
    if (user.passwordHash !== passwordHash && user.passwordHash !== 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      throw new Error('Invalid email or password.');
    }

    this.saveSession(user);
    return this.currentUser;
  }

  // Change Password
  async changePassword(userId, currentPassword, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    const user = await db.getById(DB_STORES.USERS, userId);
    if (!user) throw new Error('User not found.');

    const currentHash = await this.hashPassword(currentPassword);
    if (user.passwordHash !== currentHash && user.passwordHash !== 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
      throw new Error('Current password is incorrect.');
    }

    const newHash = await this.hashPassword(newPassword);
    await db.update(DB_STORES.USERS, userId, { passwordHash: newHash });
    return true;
  }

  // Update Profile Image
  async updateProfileImage(userId, imageUrl) {
    const updated = await db.update(DB_STORES.USERS, userId, { profileImage: imageUrl });
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.profileImage = imageUrl;
      this.saveSession(this.currentUser);
    }
    return updated;
  }

  logout() {
    this.clearSession();
  }
}

export const auth = new AuthService();
