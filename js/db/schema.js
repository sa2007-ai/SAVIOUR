/**
 * Database Schema and Entity Constants for SAVIOUR Platform
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN'
};

export const REPORT_TYPES = {
  LOST: 'LOST',
  FOUND: 'FOUND'
};

export const REPORT_STATUS = {
  SEARCHING: 'SEARCHING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  POTENTIAL_MATCH: 'POTENTIAL_MATCH',
  VERIFIED: 'VERIFIED',
  RECOVERED: 'RECOVERED',
  RESOLVED: 'RESOLVED'
};

export const ISSUE_CATEGORIES = {
  INFRASTRUCTURE: 'Infrastructure',
  ACADEMICS: 'Academics',
  FACULTY: 'Faculty',
  STUDENT_SUPPORT: 'Student Support',
  CONFIDENTIAL: 'Confidential'
};

export const ACADEMIC_YEARS = [
  { id: '1st', label: 'First Year' },
  { id: '2nd', label: 'Second Year' },
  { id: '3rd', label: 'Third Year' },
  { id: '4th', label: 'Fourth Year' }
];

export const DB_STORES = {
  USERS: 'users',
  REPORTS: 'lostFoundReports',
  MATCHES: 'matches',
  DEPARTMENTS: 'departments',
  EMERGENCY: 'emergencyCategories',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'systemSettings'
};
