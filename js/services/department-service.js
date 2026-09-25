/**
 * Department and Campus Issue Reporting Service
 * Enforces single department-level reporting email model across all academic years.
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES } from '../db/schema.js';
import { auth } from '../auth/auth-service.js';

class DepartmentService {
  async getDepartments(includeDisabled = false) {
    const list = await db.getAll(DB_STORES.DEPARTMENTS);
    if (includeDisabled) return list;
    return list.filter(d => d.enabled !== false);
  }

  async getDepartmentById(id) {
    return db.getById(DB_STORES.DEPARTMENTS, id);
  }

  // Admin updates department info (automatically updates all years)
  async updateDepartment(id, { name, shortName, reportingEmail, reportingAuthority, instructions, enabled, availableYears }) {
    if (!reportingEmail || !reportingEmail.includes('@')) {
      throw new Error('Please provide a valid department reporting email.');
    }
    
    return db.update(DB_STORES.DEPARTMENTS, id, {
      name,
      shortName,
      reportingEmail: reportingEmail.trim().toLowerCase(),
      reportingAuthority,
      instructions,
      enabled,
      availableYears: availableYears || ['1st', '2nd', '3rd', '4th']
    });
  }

  async createDepartment(deptData) {
    if (!deptData.reportingEmail || !deptData.reportingEmail.includes('@')) {
      throw new Error('Please provide a valid department reporting email.');
    }
    return db.create(DB_STORES.DEPARTMENTS, {
      ...deptData,
      enabled: true,
      availableYears: deptData.availableYears || ['1st', '2nd', '3rd', '4th']
    });
  }

  async deleteDepartment(id) {
    return db.delete(DB_STORES.DEPARTMENTS, id);
  }

  // Generate Mailto URL with student and department metadata
  generateReportMailto({ department, year, category, issueSummary, issueDetails }) {
    const student = auth.getCurrentUser();
    const studentEmail = student ? student.email : '';
    const studentName = student ? student.name : 'Student';

    const recipient = department.reportingEmail;
    const subject = encodeURIComponent(`Student Issue Report — ${department.shortName} ${year}`);
    
    const bodyContent = 
`Respected Authority (${department.reportingAuthority}),

I am submitting a campus concern via SAVIOUR.

--- STUDENT DETAILS ---
Name: ${studentName}
Registered Email: ${studentEmail}
Department: ${department.name} (${department.shortName})
Academic Year: ${year}
Category: ${category}

--- ISSUE SUMMARY ---
${issueSummary || 'Campus Issue Report'}

--- DETAILED DESCRIPTION ---
${issueDetails || '[Please elaborate your issue here in detail...]'}

---
Sent securely via SAVIOUR - Smart Campus Assistance Platform.`;

    const body = encodeURIComponent(bodyContent);
    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  }
}

export const departmentService = new DepartmentService();
