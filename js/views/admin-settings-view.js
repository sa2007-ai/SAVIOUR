/**
 * Admin Profile & System Settings View
 * Configures AI matching similarity threshold (default 60%), reporting interval (14 days), and admin account credentials.
 */

import { auth } from '../auth/auth-service.js';
import { db } from '../db/storage-engine.js';

export class AdminSettingsView {
  constructor(app) {
    this.app = app;
  }

  async render(container) {
    const admin = auth.getCurrentUser();
    const settings = await db.getSettings();

    container.innerHTML = `
      <div class="admin-settings-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Admin Profile & Settings</h2>
          <p style="font-size: 12px; color: var(--text-secondary);">Manage executive credentials and platform-wide configuration.</p>
        </div>

        <!-- 1. Admin Identity Card -->
        <div class="card card-glass" style="padding: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; overflow: hidden; border: 3px solid var(--brand-accent); flex-shrink: 0;">
            <img src="${admin.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'}" alt="Admin" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${admin.name}</h3>
            <div style="font-size: 12px; color: var(--text-secondary);">${admin.email}</div>
            <div style="margin-top: 4px; display: flex; gap: 6px;">
              <span class="badge" style="background: #fef3c7; color: #b45309; font-size: 10px;">CAMPUS ADMINISTRATOR</span>
            </div>
          </div>
        </div>

        <!-- 2. System Settings (Threshold & Cooldown Rules) -->
        <div class="card" style="padding: 18px; margin-bottom: 16px;">
          <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.4px;">
            Core System Configuration
          </h4>

          <form id="system-settings-form">
            
            <!-- AI Matching Threshold Slider -->
            <div class="settings-range-box">
              <div class="settings-range-header">
                <div>
                  <strong style="font-size: 13px; color: var(--text-primary);">Smart Matching Threshold</strong>
                  <div style="font-size: 11px; color: var(--text-muted);">Triggers "Potential Match" when similarity reaches this level.</div>
                </div>
                <span id="threshold-val-display" class="settings-range-val">${settings.matchingThreshold || 60}%</span>
              </div>
              <input type="range" id="threshold-slider" min="40" max="95" step="5" value="${settings.matchingThreshold || 60}" style="width: 100%; cursor: pointer;">
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted);">
                <span>40% (Lenient)</span>
                <span>60% (Default)</span>
                <span>95% (Strict)</span>
              </div>
            </div>

            <!-- Infrastructure Reporting Cooldown -->
            <div class="form-group">
              <label class="form-label">CR Infrastructure Report Frequency (Days)</label>
              <input type="number" id="infra-cooldown-input" class="form-input" value="${settings.infraReportCooldownDays || 14}" min="1" max="60" required>
              <span class="form-hint">Default is 14 days (once every two weeks).</span>
            </div>

            <!-- Institution Name -->
            <div class="form-group">
              <label class="form-label">Institution / Campus Name</label>
              <input type="text" id="institution-name-input" class="form-input" value="${settings.institutionName || 'Smart Campus University'}" required>
            </div>

            <button type="submit" class="btn btn-primary btn-full" style="height: 44px; font-size: 14px; margin-top: 8px;">
              💾 Save System Parameters
            </button>
          </form>
        </div>

        <!-- 3. Account Password & Reset Options -->
        <div class="card" style="padding: 18px; margin-bottom: 20px;">
          <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.4px;">
            Administrator Security
          </h4>

          <form id="admin-password-form" style="display: flex; flex-direction: column; gap: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Current Admin Password</label>
              <input type="password" id="admin-curr-pass" class="form-input" placeholder="••••••••" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">New Admin Password</label>
              <input type="password" id="admin-new-pass" class="form-input" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="align-self: flex-start; margin-top: 4px;">
              Update Security Key
            </button>
          </form>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border-light); display: flex; flex-direction: column; gap: 8px;">
            <button id="btn-reset-demo-db" class="btn btn-secondary btn-full btn-sm" style="color: var(--status-danger);">
              ⚠️ Reset Database to Demo Defaults
            </button>
            <button id="btn-admin-logout" class="btn btn-danger btn-full" style="height: 44px; font-size: 14px;">
              🚪 Sign Out of Administrator Portal
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container, admin, settings);
  }

  bindEvents(container, admin, settings) {
    const slider = container.querySelector('#threshold-slider');
    const sliderDisplay = container.querySelector('#threshold-val-display');
    const settingsForm = container.querySelector('#system-settings-form');
    const passForm = container.querySelector('#admin-password-form');

    slider.oninput = (e) => {
      sliderDisplay.textContent = `${e.target.value}%`;
    };

    settingsForm.onsubmit = async (e) => {
      e.preventDefault();
      const matchingThreshold = parseInt(slider.value, 10);
      const infraReportCooldownDays = parseInt(container.querySelector('#infra-cooldown-input').value, 10);
      const institutionName = container.querySelector('#institution-name-input').value.trim();

      await db.updateSettings({
        matchingThreshold,
        infraReportCooldownDays,
        institutionName
      });

      this.app.toast('System settings saved successfully!', 'success');
    };

    passForm.onsubmit = async (e) => {
      e.preventDefault();
      const curr = container.querySelector('#admin-curr-pass').value;
      const next = container.querySelector('#admin-new-pass').value;
      try {
        await auth.changePassword(admin.id, curr, next);
        this.app.toast('Admin password updated!', 'success');
        passForm.reset();
      } catch (err) {
        this.app.toast(err.message, 'error');
      }
    };

    container.querySelector('#btn-reset-demo-db').onclick = () => {
      if (confirm('Reset entire platform database (reports, matches, departments) to clean seed state?')) {
        db.resetAll();
        this.app.toast('Database restored to demo defaults', 'info');
        setTimeout(() => window.location.reload(), 500);
      }
    };

    container.querySelector('#btn-admin-logout').onclick = () => {
      auth.logout();
      this.app.toast('Logged out of Admin Desk', 'info');
      this.app.onAuthSuccess();
    };
  }
}
