/**
 * Automated Programmatic Test Suite for SAVIOUR Platform Core Logic
 */

import { auth } from './js/auth/auth-service.js';
import { matchingEngine } from './js/services/matching-engine.js';
import { departmentService } from './js/services/department-service.js';
import { emergencyService } from './js/services/emergency-service.js';
import { db } from './js/db/storage-engine.js';
import { DB_STORES, ROLES, REPORT_TYPES, REPORT_STATUS } from './js/db/schema.js';

console.log('=== RUNNING SAVIOUR PROGRAMMATIC TEST SUITE ===');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Email Prefix Rule Tests
  console.log('\n--- 1. Testing Email Prefix Validation Rules ---');
  assert(auth.validateStudentEmail('21cse042@college.edu') === true, 'Student email starting with "2" is accepted');
  assert(auth.validateStudentEmail('2024student@gmail.com') === true, 'Student email starting with "2" (gmail) is accepted');
  assert(auth.validateStudentEmail('123student@college.edu') === false, 'Student email NOT starting with "2" is rejected');
  assert(auth.validateStudentEmail('student@college.edu') === false, 'Student email starting with letter is rejected');

  assert(auth.validateAdminEmail('3001admin@college.edu') === true, 'Admin email starting with "3" is accepted');
  assert(auth.validateAdminEmail('3faculty@college.edu') === true, 'Admin email starting with "3" is accepted');
  assert(auth.validateAdminEmail('21admin@college.edu') === false, 'Admin email starting with "2" is rejected');
  assert(auth.validateAdminEmail('admin@college.edu') === false, 'Admin email starting with letter is rejected');

  // 2. Department-Level Single Email Model & Cascade
  console.log('\n--- 2. Testing Department Reporting Email Cascade ---');
  const depts = await departmentService.getDepartments();
  const cseDept = depts.find(d => d.shortName === 'CSE');
  assert(cseDept !== undefined, 'CSE department exists in initial seed');
  assert(cseDept.reportingEmail === 'cse.head@college.edu', 'CSE department email is cse.head@college.edu');

  const mailto1stYear = departmentService.generateReportMailto({
    department: cseDept,
    year: '1st Year',
    category: 'Academics',
    issueSummary: 'Lab Equipment Maintenance',
    issueDetails: 'System 4 in Room 302 needs OS reinstall'
  });

  assert(mailto1stYear.includes('mailto:cse.head@college.edu'), 'Mailto targets department single email for 1st year');
  assert(decodeURIComponent(mailto1stYear).includes('Student Issue Report — CSE 1st Year'), 'Mailto generates correct subject with dept and year');

  // 3. Smart Matching Engine & 60% Threshold
  console.log('\n--- 3. Testing Smart Matching Engine (60% Threshold) ---');
  const lostLaptop = {
    id: 'test_lost_1',
    userId: 'usr_student_1',
    type: REPORT_TYPES.LOST,
    itemName: 'Space Grey HP Envy Laptop',
    category: 'Electronics',
    description: 'HP Laptop with stickers on top lid',
    date: '2026-08-25',
    location: 'Central Library 2nd Floor',
    color: 'Space Grey / Black',
    identifyingCharacteristics: 'Octocat sticker'
  };

  const foundLaptop = {
    id: 'test_found_1',
    userId: 'usr_admin_1',
    type: REPORT_TYPES.FOUND,
    itemName: 'HP Laptop with Sticker',
    category: 'Electronics',
    description: 'Found grey HP notebook laptop with stickers',
    date: '2026-08-25',
    location: 'Central Library Reference Desk',
    color: 'Grey / Black',
    identifyingCharacteristics: 'Stickers on cover'
  };

  const similarityScore = matchingEngine.calculateSimilarity(lostLaptop, foundLaptop);
  console.log(`Calculated Similarity Score: ${similarityScore}%`);
  assert(similarityScore >= 60, `Matching algorithm calculates >= 60% similarity for similar laptop items (Got ${similarityScore}%)`);

  const unmatchingItem = {
    id: 'test_found_unrelated',
    userId: 'usr_admin_1',
    type: REPORT_TYPES.FOUND,
    itemName: 'Red Umbrella',
    category: 'Accessories',
    description: 'Red folding rain umbrella',
    date: '2026-08-01',
    location: 'Cricket Ground',
    color: 'Red',
    identifyingCharacteristics: 'Wooden handle'
  };

  const unmatchingScore = matchingEngine.calculateSimilarity(lostLaptop, unmatchingItem);
  console.log(`Unrelated Item Similarity Score: ${unmatchingScore}%`);
  assert(unmatchingScore < 30, `Unrelated item scores far below threshold (Got ${unmatchingScore}%)`);

  // 4. Emergency Services & Direct Calling
  console.log('\n--- 4. Testing Emergency Services Model ---');
  const emergencies = await emergencyService.getCategories();
  assert(emergencies.length >= 6, 'All 6 initial emergency categories are loaded');
  const medical = emergencies.find(e => e.title.includes('Medical'));
  assert(medical && medical.phone.length > 5, 'Medical emergency hotline is configured');

  // 5. Dynamic Statistics Computation
  console.log('\n--- 5. Testing Dynamic DB Statistics Query ---');
  const allReports = await db.getAll(DB_STORES.REPORTS);
  const totalLost = allReports.filter(r => r.type === REPORT_TYPES.LOST).length;
  const totalFound = allReports.filter(r => r.type === REPORT_TYPES.FOUND).length;
  assert(totalLost > 0, `Dynamic statistics computes total lost items (${totalLost})`);
  assert(totalFound > 0, `Dynamic statistics computes total found items (${totalFound})`);

  console.log(`\n==============================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================`);
}

runTests();
