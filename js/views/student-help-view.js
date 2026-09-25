/**
 * Student HELP View — Emergency Assistance Module
 * High-priority quick-access cards with one-tap calling (tel:) and emergency email (mailto:).
 */

import { emergencyService } from '../services/emergency-service.js';

export class StudentHelpView {
  constructor(app) {
    this.app = app;
    this.selectedCategoryId = null;
  }

  async render(container) {
    const categories = await emergencyService.getCategories();
    const activeCategory = categories.find(c => c.id === this.selectedCategoryId) || categories[0];

    container.innerHTML = `
      <div class="student-help-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header & Pillar Tagline -->
        <div style="margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; font-size: 10px;">HELP MODULE</span>
            <span style="font-size: 11.5px; font-weight: 700; color: var(--brand-accent);">“Need help? Find it fast.”</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Campus Emergency Help</h2>
          <p style="font-size: 12px; color: var(--text-secondary);">Direct access to 24/7 on-call campus security, ambulances, wardens, and counseling.</p>
        </div>

        <!-- Quick 2-Column Touch Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px;">
          ${categories.map(cat => {
            const isSelected = activeCategory && activeCategory.id === cat.id;
            return `
              <div class="card card-3d-interactive emergency-cat-card" data-cat-id="${cat.id}" style="padding: 14px 12px; cursor: pointer; border: 2px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-light)'}; background: ${isSelected ? 'linear-gradient(135deg, var(--bg-card) 60%, rgba(239,246,255,0.9))' : 'var(--bg-card)'}; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <span style="font-size: 26px; display: block; margin-bottom: 6px;">${cat.icon || '🚨'}</span>
                  <h4 style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); line-height: 1.25; margin-bottom: 4px;">
                    ${cat.title}
                  </h4>
                  <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    ${cat.description}
                  </p>
                </div>
                <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: ${isSelected ? 'var(--brand-primary)' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: space-between;">
                  <span>${isSelected ? '● Selected' : 'View Info'}</span>
                  <span>&rarr;</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Active Category Emergency Detail Panel -->
        ${activeCategory ? `
          <div class="card card-glass animate-fade-in" style="padding: 18px; border: 2px solid #3b82f6; box-shadow: var(--shadow-lg); background: linear-gradient(180deg, var(--bg-card) 0%, rgba(239,246,255,0.7) 100%);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 28px;">${activeCategory.icon || '🏥'}</span>
                <div>
                  <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary);">${activeCategory.title}</h3>
                  <div style="font-size: 11px; color: var(--text-muted);">24/7 Verified Emergency Line</div>
                </div>
              </div>
              <span class="badge" style="background: #10b981; color: white; font-size: 10px;">ONLINE</span>
            </div>

            <!-- What to do guidance -->
            <div style="background: #fffbeb; border: 1px solid #fef08a; padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 12px;">
              <div style="font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase;">📋 What to do:</div>
              <div style="font-size: 12px; color: #78350f; margin-top: 2px; line-height: 1.35;">
                ${activeCategory.instructions || 'Stay in a safe zone and reach out immediately via the contact buttons below.'}
              </div>
            </div>

            <!-- Contact Information Grid -->
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>👨‍💼</span>
                <span><strong>Authority:</strong> ${activeCategory.authority}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📍</span>
                <span><strong>Office:</strong> ${activeCategory.location}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📞</span>
                <span><strong>Phone:</strong> <strong style="color: var(--brand-primary); font-size: 13.5px;">${activeCategory.phone}</strong></span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📧</span>
                <span><strong>Email:</strong> ${activeCategory.email}</span>
              </div>
            </div>

            <!-- Primary Action Buttons (Call Now & Email) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <button id="btn-call-emergency" class="btn btn-primary" style="background: #10b981; border: none; height: 46px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 14px rgba(16,185,129,0.35);">
                📞 Call Now
              </button>
              <button id="btn-email-emergency" class="btn btn-secondary" style="height: 46px; font-size: 14px; font-weight: 700;">
                ✉️ Email Desk
              </button>
            </div>

          </div>
        ` : ''}

      </div>
    `;

    this.bindEvents(container, activeCategory);
  }

  bindEvents(container, activeCategory) {
    container.querySelectorAll('.emergency-cat-card').forEach(card => {
      card.onclick = () => {
        this.selectedCategoryId = card.dataset.catId;
        this.render(container);
      };
    });

    if (activeCategory) {
      const callBtn = container.querySelector('#btn-call-emergency');
      const emailBtn = container.querySelector('#btn-email-emergency');

      if (callBtn) {
        callBtn.onclick = () => {
          this.app.toast(`Dialing ${activeCategory.title} hotline (${activeCategory.phone})...`, 'success');
          // Trigger Haptic Vibration if supported
          if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
          emergencyService.triggerCall(activeCategory.phone);
        };
      }

      if (emailBtn) {
        emailBtn.onclick = () => {
          this.app.toast(`Composing emergency email to ${activeCategory.authority}...`, 'info');
          emergencyService.triggerEmail(activeCategory.email, activeCategory.title);
        };
      }
    }
  }
}
