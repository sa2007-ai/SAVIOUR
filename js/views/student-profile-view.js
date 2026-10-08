/**
 * Student Profile View
 * Profile picture upload, personal details, change password, notifications list, and logout.
 */

import { auth } from '../auth/auth-service.js';
import { notificationService } from '../services/notification-service.js';

export class StudentProfileView {
  constructor(app) {
    this.app = app;
  }

  async render(container) {
    const user = auth.getCurrentUser();
    const notifications = await notificationService.getUserNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    container.innerHTML = `
      <div class="student-profile-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Student Account</h2>
          <p style="font-size: 12px; color: var(--text-secondary);">Manage personal credentials, security, and notification feeds.</p>
        </div>

        <!-- 1. Profile Avatar Card -->
        <div class="card card-glass" style="padding: 18px; text-align: center; margin-bottom: 16px;">
          <div style="position: relative; width: 84px; height: 84px; margin: 0 auto 10px;">
            <img id="profile-avatar-img" src="${user.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.name}" alt="Avatar" style="width: 100%; height: 100%; border-radius: var(--radius-full); object-fit: cover; border: 3px solid var(--brand-primary); box-shadow: var(--shadow-md);">
            <button id="btn-change-avatar" style="position: absolute; bottom: 0; right: 0; background: var(--brand-primary); color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              📷
            </button>
            <input type="file" id="avatar-file-input" accept="image/*" style="display: none;">
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary);">${user.name}</h3>
          <div style="font-size: 12px; color: var(--brand-primary); font-weight: 600; margin-top: 2px;">🧑‍🎓 Verified Student Account</div>
        </div>

        <!-- 2. Personal Details -->
        <div class="card" style="padding: 16px; margin-bottom: 16px;">
          <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.4px;">
            Personal Details
          </h4>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
              <span style="color: var(--text-secondary);">Full Name:</span>
              <strong style="color: var(--text-primary);">${user.name}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
              <span style="color: var(--text-secondary);">Student Email:</span>
              <strong style="color: var(--text-primary); font-family: monospace;">${user.email}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Role:</span>
              <span class="badge" style="background: #eff6ff; color: var(--brand-primary);">STUDENT</span>
            </div>
          </div>
        </div>

        <!-- 3. Notifications Feed -->
        <div class="card" style="padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.4px;">
              Notifications (${unreadCount} unread)
            </h4>
            ${unreadCount > 0 ? `
              <button id="btn-mark-all-read" class="btn btn-sm btn-secondary" style="font-size: 10.5px; padding: 4px 8px;">
                Mark all read
              </button>
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${notifications.length === 0 ? `
              <div style="text-align: center; font-size: 12px; color: var(--text-muted); padding: 12px 0;">
                You're all caught up. No notifications.
              </div>
            ` : notifications.map(n => `
              <div style="background: ${n.read ? 'var(--bg-card-muted)' : '#eff6ff'}; border: 1px solid ${n.read ? 'var(--border-light)' : '#bfdbfe'}; border-radius: var(--radius-md); padding: 10px 12px; font-size: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <strong style="color: var(--text-primary); font-size: 12.5px;">${n.title}</strong>
                  <span style="font-size: 10px; color: var(--text-muted);">${new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p style="color: var(--text-secondary); margin-top: 3px; line-height: 1.35;">${n.message}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. Appearance & Theme Settings -->
        <div class="theme-switch-card">
          <div class="theme-switch-info">
            <div class="theme-switch-icon" id="theme-switch-icon-indicator">
              ${this.app.currentTheme === 'dark' ? '🌙' : '☀️'}
            </div>
            <div>
              <div class="theme-switch-label">Theme & Appearance</div>
              <div class="theme-switch-sub theme-current-label">${this.app.currentTheme === 'dark' ? 'Night Mode (Dark)' : 'Day Mode (Light)'}</div>
            </div>
          </div>
          <label class="switch-toggle" title="Toggle Night / Day Mode">
            <input type="checkbox" id="student-theme-toggle" class="theme-toggle-checkbox" ${this.app.currentTheme === 'dark' ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        </div>

        <!-- 5. Account & Security (Change Password & Logout) -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.4px;">
            Account Security
          </h4>

          <form id="change-password-form" style="display: flex; flex-direction: column; gap: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">Current Password</label>
              <input type="password" id="curr-password-input" class="form-input" placeholder="••••••••" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 12px;">New Password</label>
              <input type="password" id="new-password-input" class="form-input" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="align-self: flex-start; margin-top: 4px;">
              Update Password
            </button>
          </form>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed var(--border-light);">
            <button id="btn-student-logout" class="btn btn-danger btn-full" style="height: 44px; font-size: 14px;">
              🚪 Sign Out of SAVIOUR
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container, user);
  }

  bindEvents(container, user) {
    // Theme toggle switch
    const themeToggle = container.querySelector('#student-theme-toggle');
    const themeIcon = container.querySelector('#theme-switch-icon-indicator');
    const themeLabel = container.querySelector('.theme-current-label');

    if (themeToggle) {
      themeToggle.onchange = () => {
        this.app.toggleTheme();
        const isDark = this.app.currentTheme === 'dark';
        if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
        if (themeLabel) themeLabel.textContent = isDark ? 'Night Mode (Dark)' : 'Day Mode (Light)';
      };
    }

    // Avatar upload trigger
    const avatarInput = container.querySelector('#avatar-file-input');
    const changeAvatarBtn = container.querySelector('#btn-change-avatar');
    const avatarImg = container.querySelector('#profile-avatar-img');

    changeAvatarBtn.onclick = () => avatarInput.click();
    avatarInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target.result;
        avatarImg.src = base64;
        await auth.updateProfileImage(user.id, base64);
        this.app.toast('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
    };

    // Mark all read
    const markReadBtn = container.querySelector('#btn-mark-all-read');
    if (markReadBtn) {
      markReadBtn.onclick = async () => {
        await notificationService.markAllAsRead();
        this.render(container);
        this.app.updateHeaderBadges();
      };
    }

    // Change password form
    const passForm = container.querySelector('#change-password-form');
    passForm.onsubmit = async (e) => {
      e.preventDefault();
      const curr = container.querySelector('#curr-password-input').value;
      const next = container.querySelector('#new-password-input').value;
      try {
        await auth.changePassword(user.id, curr, next);
        this.app.toast('Password changed successfully!', 'success');
        passForm.reset();
      } catch (err) {
        this.app.toast(err.message, 'error');
      }
    };

    // Logout
    container.querySelector('#btn-student-logout').onclick = () => {
      auth.logout();
      this.app.toast('Logged out successfully', 'info');
      this.app.onAuthSuccess();
    };
  }
}
