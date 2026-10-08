/**
 * SAVIOUR — Main Application Controller & Router
 */
import { firebaseApp, firestore } from '../src/firebase/firebase-config.js';
import { auth } from './auth/auth-service.js';
import { notificationService } from './services/notification-service.js';
import { WelcomeAuthView } from './views/welcome-auth-view.js';
import { StudentHomeView } from './views/student-home-view.js';
import { StudentReportView } from './views/student-report-view.js';
import { StudentHelpView } from './views/student-help-view.js';
import { StudentProfileView } from './views/student-profile-view.js';
import { AdminDashboardView } from './views/admin-dashboard-view.js';
import { AdminLostFoundView } from './views/admin-lostfound-view.js';
import { AdminDepartmentView } from './views/admin-department-view.js';
import { AdminEmergencyView } from './views/admin-emergency-view.js';
import { AdminSettingsView } from './views/admin-settings-view.js';

class SaviourApp {
  constructor() {
    this.activeTab = 'home';
    const saved = localStorage.getItem('saviour_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.currentTheme = saved || (prefersDark ? 'dark' : 'light');
    this.initElements();
    this.initTheme();
    this.initRouter();
  }

  initElements() {
    this.mobileWrapper = document.getElementById('mobile-device-wrapper');
    this.appHeader = document.getElementById('app-top-header');
    this.appContent = document.getElementById('app-main-content');
    this.bottomNav = document.getElementById('app-bottom-nav');
    this.timeDisplay = document.getElementById('status-time-display');
    this.notifDot = document.getElementById('header-notif-dot');
    this.themeToggleBtn = document.getElementById('btn-toggle-theme');
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeControls();
    if (this.themeToggleBtn) {
      this.themeToggleBtn.onclick = () => this.toggleTheme();
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('saviour_theme', this.currentTheme);
    this.updateThemeControls();
    this.toast(this.currentTheme === 'dark' ? '🌙 Night mode activated' : '☀️ Day mode activated', 'info');
  }

  updateThemeControls() {
    const isDark = this.currentTheme === 'dark';
    if (this.themeToggleBtn) {
      this.themeToggleBtn.innerHTML = isDark ? '☀️' : '🌙';
      this.themeToggleBtn.title = isDark ? 'Switch to Day Mode' : 'Switch to Night Mode';
    }
    document.querySelectorAll('.theme-toggle-checkbox').forEach(input => {
      input.checked = isDark;
    });
    document.querySelectorAll('.theme-current-label').forEach(label => {
      label.textContent = isDark ? 'Night Mode (Dark)' : 'Day Mode (Light)';
    });
    document.querySelectorAll('.welcome-theme-toggle').forEach(btn => {
      btn.innerHTML = isDark ? '☀️ Day Mode' : '🌙 Night Mode';
    });
  }

   
  initRouter() {
    // Header notification click
    const notifBtn = document.getElementById('btn-header-notifications');
    if (notifBtn) {
      notifBtn.onclick = () => {
        if (auth.isStudent()) {
          this.switchStudentTab('profile');
        } else if (auth.isAdmin()) {
          this.switchAdminTab('lostfound');
        }
      };
    }

    this.renderCurrentState();
  }

  onAuthSuccess() {
    this.activeTab = auth.isAdmin() ? 'dashboard' : 'home';
    this.renderCurrentState();
  }

  async renderCurrentState() {
    if (!auth.isLoggedIn()) {
      // Show Welcome / Authentication View
      this.appHeader.style.display = 'none';
      this.bottomNav.style.display = 'none';
      const welcomeView = new WelcomeAuthView(this);
      welcomeView.render(this.appContent);
      return;
    }

    // Authenticated User
    this.appHeader.style.display = 'flex';
    this.bottomNav.style.display = 'flex';
    this.updateHeaderBadges();

    if (auth.isStudent()) {
      this.renderStudentNavigation();
      this.renderStudentTab(this.activeTab);
    } else if (auth.isAdmin()) {
	this.activeTab = this.activeTab === 'home' ? 'dashboard' : this.activeTab;
      this.renderAdminNavigation();
      this.renderAdminTab(this.activeTab);
    }
  }

  async updateHeaderBadges() {
    const count = await notificationService.getUnreadCount();
    if (this.notifDot) {
      this.notifDot.style.display = count > 0 ? 'block' : 'none';
    }
  }

  // STUDENT NAVIGATION (4 Primary Tabs)
  renderStudentNavigation() {
    this.bottomNav.innerHTML = `
      <button class="nav-tab-item ${this.activeTab === 'home' ? 'active' : ''}" data-tab="home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span class="nav-tab-label">Home</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'report' ? 'active' : ''}" data-tab="report">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="nav-tab-label">Report</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'help' ? 'active' : ''}" data-tab="help">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span class="nav-tab-label">Help</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span class="nav-tab-label">Profile</span>
      </button>
    `;

    this.bottomNav.querySelectorAll('.nav-tab-item').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.dataset.tab;
        this.switchStudentTab(tab);
      };
    });
  }

  switchStudentTab(tab) {
    this.activeTab = tab;
    this.renderStudentNavigation();
    this.renderStudentTab(tab);
  }

  renderStudentTab(tab) {
    this.appContent.innerHTML = '';
    if (tab === 'home') {
      new StudentHomeView(this).render(this.appContent);
    } else if (tab === 'report') {
      new StudentReportView(this).render(this.appContent);
    } else if (tab === 'help') {
      new StudentHelpView(this).render(this.appContent);
    } else if (tab === 'profile') {
      new StudentProfileView(this).render(this.appContent);
    }
  }

  // ADMIN NAVIGATION (5 Specialized Tabs)
  renderAdminNavigation() {
    this.bottomNav.innerHTML = `
      <button class="nav-tab-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-admin-tab="dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span class="nav-tab-label">Dashboard</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'lostfound' ? 'active' : ''}" data-admin-tab="lostfound">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span class="nav-tab-label">Lost & Found</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'reports' ? 'active' : ''}" data-admin-tab="reports">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
        <span class="nav-tab-label">Reports</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'help' ? 'active' : ''}" data-admin-tab="help">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span class="nav-tab-label">Help</span>
      </button>
      <button class="nav-tab-item ${this.activeTab === 'profile' ? 'active' : ''}" data-admin-tab="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        <span class="nav-tab-label">Settings</span>
      </button>
    `;

    this.bottomNav.querySelectorAll('.nav-tab-item').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.dataset.adminTab;
        this.switchAdminTab(tab);
      };
    });
  }

  switchAdminTab(tab) {
    this.activeTab = tab;
    this.renderAdminNavigation();
    this.renderAdminTab(tab);
  }

  renderAdminTab(tab) {
    this.appContent.innerHTML = '';
    if (tab === 'dashboard') {
      new AdminDashboardView(this).render(this.appContent);
    } else if (tab === 'lostfound') {
      new AdminLostFoundView(this).render(this.appContent);
    } else if (tab === 'reports') {
      new AdminDepartmentView(this).render(this.appContent);
    } else if (tab === 'help') {
      new AdminEmergencyView(this).render(this.appContent);
    } else if (tab === 'profile') {
      new AdminSettingsView(this).render(this.appContent);
    }
  }

  // Toast Notification Dispatcher
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastElem = document.createElement('div');
    toastElem.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toastElem.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toastElem);

    setTimeout(() => {
      toastElem.style.opacity = '0';
      toastElem.style.transform = 'translateY(-10px)';
      toastElem.style.transition = 'all 0.3s ease';
      setTimeout(() => toastElem.remove(), 300);
    }, 3500);
  }
}

// Instantiate global app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.saviourApp = new SaviourApp();
});
