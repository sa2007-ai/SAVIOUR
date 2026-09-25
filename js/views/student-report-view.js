/**
 * Student REPORT View — Campus Issues Module
 * Department -> Year -> Department-Level Shared Email -> Native Mailto Dispatcher.
 */

import { departmentService } from '../services/department-service.js';
import { ISSUE_CATEGORIES, ACADEMIC_YEARS } from '../db/schema.js';
import { auth } from '../auth/auth-service.js';

export class StudentReportView {
  constructor(app) {
    this.app = app;
    this.selectedCategory = ISSUE_CATEGORIES.ACADEMICS;
    this.selectedDept = null;
    this.selectedYear = '1st';
  }

  async render(container) {
    const departments = await departmentService.getDepartments();
    if (!this.selectedDept && departments.length > 0) {
      this.selectedDept = departments[0];
    }

    container.innerHTML = `
      <div class="student-report-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header & Pillar Tagline -->
        <div style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge" style="background: #eff6ff; color: var(--brand-primary); font-size: 10px;">REPORT MODULE</span>
            <span style="font-size: 11.5px; font-weight: 700; color: var(--brand-accent);">“Speak up. We’ll route it right.”</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Campus Issue Routing</h2>
          <p style="font-size: 12px; color: var(--text-secondary);">Direct email transmission to your official department head and authorities.</p>
        </div>

        <!-- Informative Notice Card -->
        <div class="card" style="background: #fffbeb; border: 1.5px solid #fde68a; padding: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 18px;">📢</span>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #92400e;">“Report responsibly. Resolve together.”</div>
              <ul style="font-size: 11.5px; color: #78350f; margin-top: 4px; padding-left: 16px; line-height: 1.4;">
                <li><strong>Infrastructure issues:</strong> Submitted by authorized Class Representatives (CRs) at a once-every-2-weeks frequency.</li>
                <li><strong>Academic & Faculty concerns:</strong> Open for all students. Routed straight to the department head.</li>
                <li><strong>Confidential:</strong> Sensitive matters are treated with strict confidentiality.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 1. Select Issue Category -->
        <div style="margin-bottom: 16px;">
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
            1. Select Issue Category
          </label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            ${Object.entries(ISSUE_CATEGORIES).map(([key, label]) => {
              let icon = '📚';
              if (key === 'INFRASTRUCTURE') icon = '🏢';
              if (key === 'FACULTY') icon = '👨‍🏫';
              if (key === 'STUDENT_SUPPORT') icon = '👤';
              if (key === 'CONFIDENTIAL') icon = '🔒';

              const isSelected = this.selectedCategory === label;
              return `
                <button type="button" class="btn category-select-btn ${isSelected ? 'btn-primary' : 'btn-secondary'}" data-category="${label}" style="justify-content: flex-start; padding: 10px 12px; font-size: 12px; border-radius: var(--radius-md);">
                  <span style="font-size: 16px;">${icon}</span>
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Select Department -->
        <div style="margin-bottom: 16px;">
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
            2. Select Department
          </label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${departments.map(d => {
              const isSelected = this.selectedDept && this.selectedDept.id === d.id;
              return `
                <button type="button" class="btn dept-select-btn ${isSelected ? 'btn-primary' : 'btn-secondary'}" data-dept-id="${d.id}" style="padding: 8px 4px; font-size: 12px; font-weight: 700;">
                  ${d.shortName}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Select Academic Year -->
        <div style="margin-bottom: 16px;">
          <label style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: block;">
            3. Select Academic Year
          </label>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            ${ACADEMIC_YEARS.map(yr => {
              const isSelected = this.selectedYear === yr.id;
              return `
                <button type="button" class="btn year-select-btn ${isSelected ? 'btn-primary' : 'btn-secondary'}" data-year="${yr.id}" style="padding: 8px 2px; font-size: 11px;">
                  ${yr.label.split(' ')[0]}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Department Target Summary & Authority Details Card -->
        ${this.selectedDept ? `
          <div class="card card-glass" style="padding: 16px; margin-bottom: 18px; border: 1.5px solid rgba(37,99,235,0.2);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span class="badge" style="background: #eff6ff; color: var(--brand-primary); font-weight: 800;">
                ${this.selectedDept.shortName} • ${this.selectedYear} Year
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">Shared Dept Email</span>
            </div>
            
            <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${this.selectedDept.name}</h4>
            
            <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              <div>👨‍💼 <strong>Reporting Authority:</strong> ${this.selectedDept.reportingAuthority}</div>
              <div>📧 <strong>Official Email:</strong> <span style="color: var(--brand-primary); font-weight: 600;">${this.selectedDept.reportingEmail}</span></div>
              <div style="margin-top: 4px; font-size: 11px; color: var(--text-muted); background: var(--bg-card-muted); padding: 6px 8px; border-radius: 6px;">
                💡 <em>${this.selectedDept.instructions || 'Submit formal queries with specific details.'}</em>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Issue Input Form -->
        <div class="card" style="padding: 16px; margin-bottom: 16px;">
          <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary);">
            Enter Issue Details
          </h4>

          <div class="form-group">
            <label class="form-label">Subject / Brief Headline *</label>
            <input type="text" id="report-issue-summary" class="form-input" placeholder="e.g. Lab 3 Projector Display Malfunction" required>
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Explanation *</label>
            <textarea id="report-issue-details" class="form-textarea" rows="3" placeholder="Provide full context, classroom number, date noticed, and impact..." required></textarea>
          </div>

          <!-- Report Now Button -->
          <button type="button" id="btn-trigger-report-now" class="btn btn-primary btn-full" style="height: 48px; font-size: 15px; font-weight: 700; margin-top: 8px;">
            ✉️ Report Now (Open Official Email)
          </button>
          
          <p style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px;">
            Tapping "Report Now" will automatically pre-fill your email app with the exact authority address and formatted subject.
          </p>
        </div>

      </div>
    `;

    this.bindEvents(container, departments);
  }

  bindEvents(container, departments) {
    // Category click
    container.querySelectorAll('.category-select-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedCategory = btn.dataset.category;
        this.render(container);
      };
    });

    // Department click
    container.querySelectorAll('.dept-select-btn').forEach(btn => {
      btn.onclick = () => {
        const found = departments.find(d => d.id === btn.dataset.deptId);
        if (found) {
          this.selectedDept = found;
          this.render(container);
        }
      };
    });

    // Year click
    container.querySelectorAll('.year-select-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedYear = btn.dataset.year;
        this.render(container);
      };
    });

    // Report Now Button
    const reportNowBtn = container.querySelector('#btn-trigger-report-now');
    if (reportNowBtn) {
      reportNowBtn.onclick = () => {
        const summaryInput = container.querySelector('#report-issue-summary');
        const detailsInput = container.querySelector('#report-issue-details');
        const summary = summaryInput ? summaryInput.value.trim() : '';
        const details = detailsInput ? detailsInput.value.trim() : '';

        if (!summary) {
          this.app.toast('Please enter a brief subject/headline.', 'error');
          if (summaryInput) summaryInput.focus();
          return;
        }

        if (!this.selectedDept) {
          this.app.toast('Please select a department.', 'error');
          return;
        }

        const mailtoUrl = departmentService.generateReportMailto({
          department: this.selectedDept,
          year: this.selectedYear,
          category: this.selectedCategory,
          issueSummary: summary,
          issueDetails: details
        });

        this.app.toast(`Opening pre-formatted email to ${this.selectedDept.shortName} authority...`, 'success');
        
        // Open native email app
        window.location.href = mailtoUrl;
      };
    }
  }
}
