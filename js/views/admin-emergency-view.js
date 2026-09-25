/**
 * Admin Emergency Management View
 * Manage emergency categories, direct calling phone numbers, on-duty authorities, and clinic locations.
 */

import { emergencyService } from '../services/emergency-service.js';

export class AdminEmergencyView {
  constructor(app) {
    this.app = app;
  }

  async render(container) {
    const categories = await emergencyService.getCategories(true);

    container.innerHTML = `
      <div class="admin-emergency-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Emergency Services</h2>
            <p style="font-size: 12px; color: var(--text-secondary);">Manage 24/7 hotlines, security squads, health clinic & locations.</p>
          </div>
          <button id="btn-add-emergency-cat" class="btn btn-sm btn-primary">
            + New Service
          </button>
        </div>

        <!-- Emergency Categories List -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${categories.map((cat, idx) => `
            <div class="card" style="padding: 16px; border: 1.5px solid ${cat.enabled ? 'var(--border-light)' : '#fca5a5'}; opacity: ${cat.enabled ? '1' : '0.75'};">
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 24px;">${cat.icon || '🚨'}</span>
                  <div>
                    <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${cat.title}</h4>
                    <span style="font-size: 11px; color: var(--text-muted);">Priority #${cat.order || (idx + 1)}</span>
                  </div>
                </div>
                <span class="badge" style="background: ${cat.enabled ? '#ecfdf5' : '#fef2f2'}; color: ${cat.enabled ? '#059669' : '#dc2626'}; font-size: 10px;">
                  ${cat.enabled ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>

              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.35; margin-bottom: 8px;">
                ${cat.description}
              </p>

              <div style="background: var(--bg-card-muted); padding: 10px 12px; border-radius: var(--radius-md); font-size: 12px; display: flex; flex-direction: column; gap: 4px; color: var(--text-secondary);">
                <div>📞 <strong>Phone:</strong> <span style="color: var(--brand-primary); font-weight: 700;">${cat.phone}</span></div>
                <div>📧 <strong>Email:</strong> ${cat.email}</div>
                <div>📍 <strong>Location:</strong> ${cat.location}</div>
                <div>👨‍⚕️ <strong>Authority:</strong> ${cat.authority}</div>
              </div>

              <!-- Action Bar -->
              <div class="admin-action-row">
                <button class="btn btn-sm btn-secondary btn-edit-emergency" data-cat-id="${cat.id}" style="padding: 4px 10px; font-size: 11.5px;">
                  ✏️ Edit Service
                </button>
                <button class="btn btn-sm btn-secondary btn-toggle-emergency" data-cat-id="${cat.id}" style="padding: 4px 8px; font-size: 11.5px;">
                  ${cat.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-sm btn-danger btn-delete-emergency" data-cat-id="${cat.id}" style="padding: 4px 8px; font-size: 11.5px;">
                  🗑️
                </button>
              </div>

            </div>
          `).join('')}
        </div>

      </div>

      <!-- Add / Edit Emergency Modal -->
      <div id="emergency-modal" class="modal-overlay">
        <div class="bottom-sheet-content">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 id="emergency-modal-title" class="sheet-title">Edit Emergency Service</h3>
            <button id="emergency-modal-close" class="sheet-close-btn">✕</button>
          </div>

          <form id="emergency-form">
            <input type="hidden" id="emg-form-id">

            <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label">Icon</label>
                <input type="text" id="emg-form-icon" class="form-input" placeholder="🏥" style="text-align: center; font-size: 20px;" maxlength="2" required>
              </div>
              <div class="form-group">
                <label class="form-label">Service Title *</label>
                <input type="text" id="emg-form-title" class="form-input" placeholder="e.g. Medical Emergency" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Short Description *</label>
              <input type="text" id="emg-form-desc" class="form-input" placeholder="24/7 on-campus ambulance & clinic response" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label">Phone Hotline *</label>
                <input type="text" id="emg-form-phone" class="form-input" placeholder="+91 98765 43210" required>
              </div>
              <div class="form-group">
                <label class="form-label">Emergency Email *</label>
                <input type="email" id="emg-form-email" class="form-input" placeholder="clinic@college.edu" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">On-Duty Authority Name *</label>
              <input type="text" id="emg-form-authority" class="form-input" placeholder="e.g. Campus Health Center (Dr. Priya Nair)" required>
            </div>

            <div class="form-group">
              <label class="form-label">Physical Campus Location *</label>
              <input type="text" id="emg-form-location" class="form-input" placeholder="e.g. Health Clinic, Block C Ground Floor" required>
            </div>

            <div class="form-group">
              <label class="form-label">What to do Instructions</label>
              <textarea id="emg-form-instructions" class="form-textarea" rows="2" placeholder="Instructions shown during emergency situations..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-full" style="height: 46px; font-size: 15px; margin-top: 8px;">
              Save Emergency Service
            </button>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(container, categories);
  }

  bindEvents(container, categories) {
    const modal = container.querySelector('#emergency-modal');
    const modalClose = container.querySelector('#emergency-modal-close');
    const form = container.querySelector('#emergency-form');
    const formTitle = container.querySelector('#emergency-modal-title');
    const idInput = container.querySelector('#emg-form-id');
    const iconInput = container.querySelector('#emg-form-icon');
    const titleInput = container.querySelector('#emg-form-title');
    const descInput = container.querySelector('#emg-form-desc');
    const phoneInput = container.querySelector('#emg-form-phone');
    const emailInput = container.querySelector('#emg-form-email');
    const authInput = container.querySelector('#emg-form-authority');
    const locInput = container.querySelector('#emg-form-location');
    const instInput = container.querySelector('#emg-form-instructions');

    const openModal = (cat = null) => {
      if (cat) {
        formTitle.textContent = `Edit ${cat.title}`;
        idInput.value = cat.id;
        iconInput.value = cat.icon || '🚨';
        titleInput.value = cat.title;
        descInput.value = cat.description;
        phoneInput.value = cat.phone;
        emailInput.value = cat.email;
        authInput.value = cat.authority;
        locInput.value = cat.location;
        instInput.value = cat.instructions || '';
      } else {
        formTitle.textContent = 'Add Emergency Service';
        form.reset();
        idInput.value = '';
        iconInput.value = '🚨';
      }
      modal.classList.add('open');
    };

    const closeModal = () => {
      modal.classList.remove('open');
      form.reset();
    };

    container.querySelector('#btn-add-emergency-cat').onclick = () => openModal(null);
    modalClose.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Edit
    container.querySelectorAll('.btn-edit-emergency').forEach(btn => {
      btn.onclick = () => {
        const cat = categories.find(c => c.id === btn.dataset.catId);
        if (cat) openModal(cat);
      };
    });

    // Toggle
    container.querySelectorAll('.btn-toggle-emergency').forEach(btn => {
      btn.onclick = async () => {
        const cat = categories.find(c => c.id === btn.dataset.catId);
        if (cat) {
          await emergencyService.updateCategory(cat.id, { enabled: !cat.enabled });
          this.app.toast(`Service ${cat.title} ${cat.enabled ? 'offline' : 'online'}`, 'info');
          this.render(container);
        }
      };
    });

    // Delete
    container.querySelectorAll('.btn-delete-emergency').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Delete this emergency service?')) {
          await emergencyService.deleteCategory(btn.dataset.catId);
          this.app.toast('Emergency service deleted', 'info');
          this.render(container);
        }
      };
    });

    // Submit
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = idInput.value;
      const catData = {
        icon: iconInput.value.trim() || '🚨',
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        authority: authInput.value.trim(),
        location: locInput.value.trim(),
        instructions: instInput.value.trim(),
        enabled: true
      };

      try {
        if (id) {
          await emergencyService.updateCategory(id, catData);
          this.app.toast(`Emergency service updated!`, 'success');
        } else {
          await emergencyService.createCategory(catData);
          this.app.toast(`Emergency service created!`, 'success');
        }
        closeModal();
        this.render(container);
      } catch (err) {
        this.app.toast(err.message, 'error');
      }
    };
  }
}
