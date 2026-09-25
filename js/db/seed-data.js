/**
 * Initial Seed Data for SAVIOUR Platform
 */

import { ROLES, REPORT_TYPES, REPORT_STATUS } from './schema.js';

export const INITIAL_USERS = [
  {
    id: 'usr_student_1',
    name: 'Aarav Sharma',
    email: '21cse042@college.edu',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // sha-256 for demo
    role: ROLES.STUDENT,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'usr_admin_1',
    name: 'Dr. Ramesh Kumar (Dean of Student Affairs)',
    email: '3001admin@college.edu',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    role: ROLES.ADMIN,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

export const INITIAL_DEPARTMENTS = [
  {
    id: 'dept_cse',
    name: 'Computer Science & Engineering',
    shortName: 'CSE',
    reportingEmail: 'cse.head@college.edu',
    reportingAuthority: 'Prof. K. Venkatesh (HOD CSE)',
    instructions: 'Submit lab hardware, curriculum feedback, or classroom technical requests.',
    enabled: true,
    availableYears: ['1st', '2nd', '3rd', '4th']
  },
  {
    id: 'dept_csm',
    name: 'Computer Science & AI / Machine Learning',
    shortName: 'CSM',
    reportingEmail: 'csm.head@college.edu',
    reportingAuthority: 'Dr. Ananya Ray (HOD CSM)',
    instructions: 'Submit AI lab GPU cluster issues, project approvals, or academic queries.',
    enabled: true,
    availableYears: ['1st', '2nd', '3rd', '4th']
  },
  {
    id: 'dept_ece',
    name: 'Electronics & Communication Engineering',
    shortName: 'ECE',
    reportingEmail: 'ece.head@college.edu',
    reportingAuthority: 'Prof. R. Sundaram (HOD ECE)',
    instructions: 'Report VLSI and IoT Lab equipment faults or semester timetable concerns.',
    enabled: true,
    availableYears: ['1st', '2nd', '3rd', '4th']
  },
  {
    id: 'dept_eee',
    name: 'Electrical & Electronics Engineering',
    shortName: 'EEE',
    reportingEmail: 'eee.head@college.edu',
    reportingAuthority: 'Dr. M. Swaminathan (HOD EEE)',
    instructions: 'Report electrical machinery workbench issues or academic assistance needs.',
    enabled: true,
    availableYears: ['1st', '2nd', '3rd', '4th']
  },
  {
    id: 'dept_me',
    name: 'Mechanical Engineering',
    shortName: 'ME',
    reportingEmail: 'mech.head@college.edu',
    reportingAuthority: 'Prof. V. Narayanan (HOD Mechanical)',
    instructions: 'Report workshop machinery, CNC tools, or thermal lab issues.',
    enabled: true,
    availableYears: ['1st', '2nd', '3rd', '4th']
  },
  {
    id: 'dept_ce',
    name: 'Civil Engineering',
    shortName: 'CE',
    reportingEmail: 'civil.head@college.edu',
    reportingAuthority: 'Dr. S. Reddy (HOD Civil)',
    instructions: 'Report surveying lab equipment or structural drawing hall facilities.',
    enabled: true,
    availableYears: ['1st', '2nd', '3rd', '4th']
  }
];

export const INITIAL_EMERGENCY_CATEGORIES = [
  {
    id: 'emg_1',
    title: 'Medical Emergency',
    icon: '🏥',
    description: 'Immediate 24/7 on-campus ambulance, first-aid & health center response.',
    instructions: 'Stay calm. If someone is unconscious, do not move them without paramedic assistance.',
    authority: 'Campus Health Center (Dr. Priya Nair)',
    email: 'healthcenter@college.edu',
    phone: '+91 98765 43210',
    location: 'Health Clinic, Block C Ground Floor (Near Main Gate)',
    order: 1,
    enabled: true
  },
  {
    id: 'emg_2',
    title: 'Student Safety & Security',
    icon: '🧑‍🎓',
    description: 'Campus security desk, emergency escorts, and ragging prevention squad.',
    instructions: 'Call immediately for trespassing, altercations, or night safety assistance.',
    authority: 'Chief Security Officer (Col. Pratap Singh)',
    email: 'security.desk@college.edu',
    phone: '+91 98765 11223',
    location: 'Security Control Room, Admin Block Entrance',
    order: 2,
    enabled: true
  },
  {
    id: 'emg_3',
    title: 'Hostel & Residential Help',
    icon: '🏠',
    description: 'Hostel warden line, water/power electrical breakdown, and emergency entry.',
    instructions: 'For late night gate permissions or sudden room issues, contact your warden.',
    authority: 'Chief Hostel Warden (Prof. David Raj)',
    email: 'hostel.warden@college.edu',
    phone: '+91 98765 88990',
    location: 'Hostel Affairs Office, Dining Hall 2',
    order: 3,
    enabled: true
  },
  {
    id: 'emg_4',
    title: 'Personal & Mental Support',
    icon: '🔒',
    description: 'Confidential counseling for academic stress, anxiety, and student wellness.',
    instructions: '100% confidential. You can book an emergency drop-in consultation.',
    authority: 'Campus Counselor (Ms. Neha Gupta)',
    email: 'counselor.wellness@college.edu',
    phone: '+91 98765 77665',
    location: 'Wellness Center, Room 104, Library 1st Floor',
    order: 4,
    enabled: true
  },
  {
    id: 'emg_5',
    title: 'Academic Urgent Issues',
    icon: '💻',
    description: 'Exam hall ticket errors, urgent grievance, or hall attendance lock.',
    instructions: 'Reach out to the Exam Branch emergency helpdesk during examination weeks.',
    authority: 'Controller of Examinations (Dr. George Matthew)',
    email: 'coe.emergency@college.edu',
    phone: '+91 98765 99001',
    location: 'Examination Section, Admin Block 2nd Floor',
    order: 5,
    enabled: true
  },
  {
    id: 'emg_6',
    title: 'General Campus Helpline',
    icon: '❓',
    description: 'General queries, lost identification, and transport shuttle breakdowns.',
    instructions: 'For any unlisted assistance, call the 24-hour student helpdesk.',
    authority: 'Student Welfare Support Cell',
    email: 'helpdesk@college.edu',
    phone: '+91 98765 00000',
    location: 'Student Union Hub, Ground Floor',
    order: 6,
    enabled: true
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'rep_lost_1',
    userId: 'usr_student_1',
    type: REPORT_TYPES.LOST,
    itemName: 'Space Grey HP Envy Laptop',
    category: 'Electronics',
    description: '15-inch HP Envy Laptop with a GitHub Octocat sticker and a carbon fiber back skin.',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    location: 'Central Library 2nd Floor Reading Hall',
    color: 'Space Grey / Black',
    identifyingCharacteristics: 'Octocat sticker on lid, slight scratch on left hinge, Intel Core i7 label.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
    currentStatus: REPORT_STATUS.POTENTIAL_MATCH,
    matchScore: 88,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'rep_found_1',
    userId: 'usr_admin_1',
    type: REPORT_TYPES.FOUND,
    itemName: 'HP Laptop with Sticker',
    category: 'Electronics',
    description: 'Found a dark grey HP notebook laptop left unattended near the reference section desk.',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    location: 'Central Library Reference Desk',
    color: 'Grey / Black',
    identifyingCharacteristics: 'Has developer stickers on the top cover. Stored safely in library lost box.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    currentStatus: REPORT_STATUS.UNDER_REVIEW,
    matchScore: 88,
    createdAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString()
  },
  {
    id: 'rep_lost_2',
    userId: 'usr_student_1',
    type: REPORT_TYPES.LOST,
    itemName: 'Casio fx-991EX Scientific Calculator',
    category: 'Stationery',
    description: 'Black and white scientific calculator with small blue marker initials on back.',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    location: 'ECE Lab Block B Room 204',
    color: 'Black / White',
    identifyingCharacteristics: 'Name sticker peeled off, "AS" written with marker inside battery lid.',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80',
    currentStatus: REPORT_STATUS.SEARCHING,
    matchScore: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'rep_found_2',
    userId: 'usr_student_1',
    type: REPORT_TYPES.FOUND,
    itemName: 'Blue Titan Stainless Steel Wristwatch',
    category: 'Accessories',
    description: 'Analog wristwatch with blue dial and metal mesh strap found near Cafeteria.',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    location: 'Main Cafeteria Counter 3',
    color: 'Silver / Blue',
    identifyingCharacteristics: 'Water resistant 50m inscription on rear casing.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80',
    currentStatus: REPORT_STATUS.RECOVERED,
    matchScore: 92,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const INITIAL_MATCHES = [
  {
    id: 'mat_1',
    lostReportId: 'rep_lost_1',
    foundReportId: 'rep_found_1',
    similarityScore: 88,
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 2 * 86400000 + 4000000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'usr_student_1',
    title: 'Potential Match Found! (88%)',
    message: 'A found report matching your "Space Grey HP Envy Laptop" was reported at Central Library.',
    type: 'MATCH',
    read: false,
    relatedReportId: 'rep_lost_1',
    createdAt: new Date(Date.now() - 2 * 86400000 + 4200000).toISOString()
  }
];

export const INITIAL_SETTINGS = {
  matchingThreshold: 60,
  infraReportCooldownDays: 14,
  appName: 'SAVIOUR',
  institutionName: 'Smart Campus University',
  supportContact: 'support.saviour@college.edu'
};
