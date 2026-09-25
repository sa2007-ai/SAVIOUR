/**
 * Admin Department & Routing Management View
 * Full CRUD for departments and central single-email configuration with cascade.
 */

import { departmentService } from '../services/department-service.js';

export class AdminDepartmentView {
  constructor(app) {
    this.app = app;
    this.editingDept = null;
  }

  async render(container) {
    const departments = await departmentService.getDepartments(true);

    container.innerHTML = `
      <div class="admin-depts-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header & Action -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Department Routing</h2>
            <p style="font-size: 12px; color: var(--text-secondary);">Manage department authorities & single-email cascade model.</p>
          </div>
          <button id="btn-add-dept" class="btn btn-sm btn-primary">
            + Add Dept
          </button>
        </div>

        <!-- Single Email Cascade Notice -->
        <div class="card" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 12px; margin-bottom: 16px; font-size: 11.5px; color: #1e40af;">
          ℹ️ <strong>System Architecture:</strong> Each department maintains ONE central reporting email that automatically routes requests for 1st, 2nd, 3rd, and 4th years without data redundancy.
        </div>

        <!-- Departments List -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${departments.map(dept => `
            <div class="card" style="padding: 16px; border: 1px solid ${dept.enabled ? 'var(--border-light)' : '#fca5a5'}; opacity: ${dept.enabled ? '1' : '0.75'};">
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge" style="background: var(--brand-primary); color: white; font-weight: 800;">${dept.shortName}</span>
                  <strong style="font-size: 14px; color: var(--text-primary);">${dept.name}</strong>
                </div>
                <span class="badge" style="background: ${dept.enabled ? '#ecfdf5' : '#fef2f2'}; color: ${dept.enabled ? '#059669' : '#dc2626'}; font-size: 10px;">
                  ${dept.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px; line-height: 1.5;">
                <div>👨‍🏫 <strong>Authority:</strong> ${dept.reportingAuthority}</div>
                <div>📧 <strong>Shared Email:</strong> <span style="font-family: monospace; color: var(--brand-primary); font-weight: 600;">${dept.reportingEmail}</span></div>
                <div style="margin-top: 4px; color: var(--text-muted); font-size: 11px;"><em>${dept.instructions || 'No special instructions.'}</em></div>
              </div>

              <!-- Available Years Badges -->
              <div class="year-pills-row">
                <span style="font-size: 11px; color: var(--text-muted); align-self: center; margin-right: 4px;">Cascaded Years:</span>
                ${(dept.availableYears || ['1st', '2nd', '3rd', '4th']).map(yr => `
                  <span class="year-pill active">${yr} Year</span>
                `).join('')}
              </div>

              <!-- Action Bar -->
              <div class="admin-action-row">
                <button class="btn btn-sm btn-secondary btn-edit-dept" data-dept-id="${dept.id}" style="padding: 4px 10px; font-size: 11.5px;">
                  ✏️ Edit / Email
                </button>
                <button class="btn btn-sm btn-secondary btn-toggle-dept" data-dept-id="${dept.id}" style="padding: 4px 8px; font-size: 11.5px;">
                  ${dept.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-sm btn-danger btn-delete-dept" data-dept-id="${dept.id}" style="padding: 4px 8px; font-size: 11.5px;">
                  🗑️
                </button>
              </div>

            </div>
          `).join('')}
        </div>

      </div>

      <!-- Add / Edit Department Modal -->
      <div id="dept-modal" class="modal-overlay">
        <div class="bottom-sheet-content">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 id="dept-modal-title" class="sheet-title">Edit Department</h3>
            <button id="dept-modal-close" class="sheet-close-btn">✕</button>
          </div>

          <form id="dept-form">
            <input type="hidden" id="dept-form-id">

            <div class="form-group">
              <label class="form-label">Full Department Name *</label>
              <input type="text" id="dept-form-name" class="form-input" placeholder="e.g. Computer Science & Engineering" required>
            </div>

            <div class="form-group">
              <label class="form-label">Short Code (e.g. CSE, CSM, ME, CE) *</label>
              <input type="text" id="dept-form-short" class="form-input" placeholder="e.g. CSE" required maxlength="6">
            </div>

            <div class="form-group">
              <label class="form-label">Central Reporting Email (Shared for all 4 years) *</label>
              <input type="email" id="dept-form-email" class="form-input" placeholder="e.g. cse.head@college.edu" required>
              <span class="form-hint">Updating this email automatically synchronizes all 4 academic years.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Reporting Authority Name & Title *</label>
              <input type="text" id="dept-form-authority" class="form-input" placeholder="e.g. Prof. K. Venkatesh (HOD CSE)" required>
            </div>

            <div class="form-group">
              <label class="form-label">Reporting Instructions / Lab Guidance</label>
              <textarea id="dept-form-instructions" class="form-textarea" rows="2" placeholder="Instructions shown to students before email dispatch..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-full" style="height: 46px; font-size: 15px; margin-top: 8px;">
              Save Department Configuration
            </button>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(container, departments);
  }

  bindEvents(container, departments) {
    const modal = container.querySelector('#dept-modal');
    const modalClose = container.querySelector('#dept-modal-close');
    const form = container.querySelector('#dept-form');
    const formTitle = container.querySelector('#dept-modal-title');
    const idInput = container.querySelector('#dept-form-id');
    const nameInput = container.querySelector('#dept-form-name');
    const shortInput = container.querySelector('#dept-form-short');
    const emailInput = container.querySelector('#dept-form-email');
    const authInput = container.querySelector('#dept-form-authority');
    const instInput = container.querySelector('#dept-form-instructions');

    const openModal = (dept = null) => {
      if (dept) {
        formTitle.textContent = `Edit ${dept.shortName} Department`;
        idInput.value = dept.id;
        nameInput.value = dept.name;
        shortInput.value = dept.shortName;
        emailInput.value = dept.reportingEmail;
        authInput.value = dept.reportingAuthority;
        instInput.value = dept.instructions || '';
      } else {
        formTitle.textContent = 'Add New Department';
        form.reset();
        idInput.value = '';
      }
      modal.classList.add('open');
    };

    const closeModal = () => {
      modal.classList.remove('open');
      form.reset();
    };

    container.querySelector('#btn-add-dept').onclick = () => openModal(null);
    modalClose.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Edit button
    container.querySelectorAll('.btn-edit-dept').forEach(btn => {
      btn.onclick = () => {
        const dept = departments.find(d => d.id === btn.dataset.deptId);
        if (dept) openModal(dept);
      };
    });

    // Toggle enabled/disabled
    container.querySelectorAll('.btn-toggle-dept').forEach(btn => {
      btn.onclick = async () => {
        const dept = departments.find(d => d.id === btn.dataset.deptId);
        if (dept) {
          await departmentService.updateDepartment(dept.id, {
            ...dept,
            enabled: !dept.enabled
          });
          this.app.toast(`Department ${dept.shortName} ${dept.enabled ? 'disabled' : 'enabled'}`, 'info');
          this.render(container);
        }
      };
    });

    // Delete
    container.querySelectorAll('.btn-delete-dept').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Delete this department?')) {
          await departmentService.deleteDepartment(btn.dataset.deptId);
          this.app.toast('Department removed', 'info');
          this.render(container);
        }
      };
    });

    // Form submit
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = idInput.value;
      const deptData = {
        name: nameInput.value.trim(),
        shortName: shortInput.value.trim().toUpperCase(),
        reportingEmail: emailInput.value.trim().toLowerCase(),
        reportingAuthority: authInput.value.trim(),
        instructions: instInput.value.trim(),
        enabled: true,
        availableYears: ['1st', '2nd', '3rd', '4th']
      };

      try {
        if (id) {
          await departmentService.updateDepartment(id, deptData);
          this.app.toast(`Updated ${deptData.shortName} reporting email across all years!`, 'success');
        } else {
          await departmentService.createDepartment(deptData);
          this.app.toast(`Created new department ${deptData.shortName}`, 'success');
        }
        closeModal();
        this.render(container);
      } catch (err) {
        this.app.toast(err.message, 'error');
      }
    };
  }
}
