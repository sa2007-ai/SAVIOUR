/**
 * Admin Dashboard View
 * Dynamic statistics computed in real-time directly from database records.
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES, REPORT_TYPES, REPORT_STATUS } from '../db/schema.js';
import { auth } from '../auth/auth-service.js';

export class AdminDashboardView {
  constructor(app) {
    this.app = app;
  }

  async render(container) {
    const admin = auth.getCurrentUser();
    const allReports = await db.getAll(DB_STORES.REPORTS);
    const allMatches = await db.getAll(DB_STORES.MATCHES);
    const settings = await db.getSettings();

    // Calculate dynamic metrics strictly from DB
    const totalLost = allReports.filter(r => r.type === REPORT_TYPES.LOST).length;
    const totalFound = allReports.filter(r => r.type === REPORT_TYPES.FOUND).length;
    const searchingCount = allReports.filter(r => r.currentStatus === REPORT_STATUS.SEARCHING).length;
    const underReviewCount = allReports.filter(r => r.currentStatus === REPORT_STATUS.UNDER_REVIEW).length;
    const potentialMatchesCount = allReports.filter(r => r.currentStatus === REPORT_STATUS.POTENTIAL_MATCH).length;
    const recoveredCount = allReports.filter(r => r.currentStatus === REPORT_STATUS.RECOVERED || r.currentStatus === REPORT_STATUS.RESOLVED).length;
    const pendingMatches = allMatches.filter(m => m.status === 'PENDING_REVIEW').length;

    container.innerHTML = `
      <div class="admin-dashboard-screen" style="padding: 14px 16px 30px;">

        <!-- Admin Welcome Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="admin-header-badge">ADMIN CONTROL</span>
              <span style="font-size: 11px; color: var(--text-muted);">${settings.institutionName || 'Smart Campus'}</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">Campus Executive Desk</h2>
          </div>
          <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; border: 2px solid var(--brand-accent);">
            <img src="${admin.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'}" alt="Admin" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>

        <!-- Real-Time Computed Statistics Grid -->
        <div class="stats-metric-grid">
          
          <div class="stat-card stat-card-lost">
            <span class="stat-title">Total Lost</span>
            <span class="stat-value" style="color: #2563eb;">${totalLost}</span>
            <span class="stat-meta">Active lost submissions</span>
          </div>

          <div class="stat-card stat-card-found">
            <span class="stat-title">Total Found</span>
            <span class="stat-value" style="color: #d97706;">${totalFound}</span>
            <span class="stat-meta">Safely deposited items</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Searching</span>
            <span class="stat-value" style="color: #0284c7;">${searchingCount}</span>
            <span class="stat-meta">Awaiting match</span>
          </div>

          <div class="stat-card">
            <span class="stat-title">Under Review</span>
            <span class="stat-value" style="color: #7c3aed;">${underReviewCount}</span>
            <span class="stat-meta">Staff verification</span>
          </div>

          <div class="stat-card stat-card-matches">
            <span class="stat-title">Potential Matches</span>
            <span class="stat-value" style="color: #d97706;">${potentialMatchesCount}</span>
            <span class="stat-meta">${pendingMatches} pending verification</span>
          </div>

          <div class="stat-card stat-card-recovered">
            <span class="stat-title">Recovered</span>
            <span class="stat-value" style="color: #059669;">${recoveredCount}</span>
            <span class="stat-meta">Resolved handovers</span>
          </div>

        </div>

        <!-- Quick Administration Shortcuts -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.4px;">
            Administrative Modules
          </h3>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            
            <button id="admin-nav-lostfound" class="btn btn-secondary" style="justify-content: space-between; padding: 14px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🔎</span>
                <div>
                  <div style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">Lost & Found Moderation</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Review candidate matches, verify ownership & update statuses</div>
                </div>
              </div>
              <span class="badge ${potentialMatchesCount > 0 ? 'badge-match' : ''}">${potentialMatchesCount} Matches</span>
            </button>

            <button id="admin-nav-depts" class="btn btn-secondary" style="justify-content: space-between; padding: 14px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🏢</span>
                <div>
                  <div style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">Department & Year Routing</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Manage department authorities & shared reporting emails</div>
                </div>
              </div>
              <span style="font-size: 14px; color: var(--text-muted);">&rarr;</span>
            </button>

            <button id="admin-nav-emergency" class="btn btn-secondary" style="justify-content: space-between; padding: 14px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🚨</span>
                <div>
                  <div style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">Emergency Services Manager</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Configure 24/7 helplines, wardens, health center & security</div>
                </div>
              </div>
              <span style="font-size: 14px; color: var(--text-muted);">&rarr;</span>
            </button>

            <button id="admin-nav-settings" class="btn btn-secondary" style="justify-content: space-between; padding: 14px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⚙️</span>
                <div>
                  <div style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">Matching Threshold & System Rules</div>
                  <div style="font-size: 11px; color: var(--text-muted);">Configure similarity score (${settings.matchingThreshold}%) & reporting frequency</div>
                </div>
              </div>
              <span style="font-size: 14px; color: var(--text-muted);">&rarr;</span>
            </button>

          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    container.querySelector('#admin-nav-lostfound').onclick = () => this.app.switchAdminTab('lostfound');
    container.querySelector('#admin-nav-depts').onclick = () => this.app.switchAdminTab('reports');
    container.querySelector('#admin-nav-emergency').onclick = () => this.app.switchAdminTab('help');
    container.querySelector('#admin-nav-settings').onclick = () => this.app.switchAdminTab('profile');
  }
}
