/**
 * Admin Lost & Found Management View
 * Review reports, inspect images, verify matches, update status transitions, and resolve handovers.
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES, REPORT_TYPES, REPORT_STATUS } from '../db/schema.js';

export class AdminLostFoundView {
  constructor(app) {
    this.app = app;
    this.activeFilter = 'ALL'; // 'ALL', 'LOST', 'FOUND', 'MATCHES', 'RECOVERED'
    this.searchQuery = '';
    this.selectedReportForModal = null;
  }

  async render(container) {
    const allReports = await db.getAll(DB_STORES.REPORTS);
    const allMatches = await db.getAll(DB_STORES.MATCHES);
    const users = await db.getAll(DB_STORES.USERS);

    let filtered = allReports;

    if (this.activeFilter === 'LOST') {
      filtered = filtered.filter(r => r.type === REPORT_TYPES.LOST);
    } else if (this.activeFilter === 'FOUND') {
      filtered = filtered.filter(r => r.type === REPORT_TYPES.FOUND);
    } else if (this.activeFilter === 'MATCHES') {
      filtered = filtered.filter(r => r.currentStatus === REPORT_STATUS.POTENTIAL_MATCH);
    } else if (this.activeFilter === 'RECOVERED') {
      filtered = filtered.filter(r => r.currentStatus === REPORT_STATUS.RECOVERED || r.currentStatus === REPORT_STATUS.RESOLVED);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.itemName.toLowerCase().includes(q) || 
        r.location.toLowerCase().includes(q) || 
        r.category.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <div class="admin-lostfound-screen" style="padding: 14px 16px 30px;">
        
        <!-- Header -->
        <div style="margin-bottom: 12px;">
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Lost & Found Moderation</h2>
          <p style="font-size: 12px; color: var(--text-secondary);">Review student submissions, inspect matches, and execute verified handovers.</p>
        </div>

        <!-- Search Bar -->
        <div class="form-group" style="margin-bottom: 10px;">
          <input type="text" id="admin-lf-search" class="form-input" placeholder="🔍 Search item, location, category..." value="${this.searchQuery}">
        </div>

        <!-- Filter Chips Bar -->
        <div class="admin-filters-bar">
          <button class="filter-chip ${this.activeFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">All (${allReports.length})</button>
          <button class="filter-chip ${this.activeFilter === 'MATCHES' ? 'active' : ''}" data-filter="MATCHES">⚡ Matches (${allReports.filter(r => r.currentStatus === REPORT_STATUS.POTENTIAL_MATCH).length})</button>
          <button class="filter-chip ${this.activeFilter === 'LOST' ? 'active' : ''}" data-filter="LOST">🔎 Lost (${allReports.filter(r => r.type === REPORT_TYPES.LOST).length})</button>
          <button class="filter-chip ${this.activeFilter === 'FOUND' ? 'active' : ''}" data-filter="FOUND">📦 Found (${allReports.filter(r => r.type === REPORT_TYPES.FOUND).length})</button>
          <button class="filter-chip ${this.activeFilter === 'RECOVERED' ? 'active' : ''}" data-filter="RECOVERED">✓ Recovered</button>
        </div>

        <!-- Reports List -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${filtered.length === 0 ? `
            <div class="empty-state card">
              <div class="empty-state-icon">📭</div>
              <div class="empty-state-title">No reports match filter</div>
              <div class="empty-state-text">Try clearing the search query or switching tabs.</div>
            </div>
          ` : filtered.map(report => this.renderAdminReportCard(report, users, allMatches)).join('')}
        </div>

      </div>

      <!-- Image & Match Inspector Modal -->
      <div id="admin-detail-modal" class="modal-overlay">
        <div class="bottom-sheet-content" style="max-height: 90vh;">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 id="admin-modal-title" class="sheet-title">Report Inspection</h3>
            <button id="admin-modal-close" class="sheet-close-btn">✕</button>
          </div>
          <div id="admin-modal-body"></div>
        </div>
      </div>
    `;

    this.bindEvents(container, allReports, users, allMatches);
  }

  renderAdminReportCard(report, users, matches) {
    const isLost = report.type === REPORT_TYPES.LOST;
    const author = users.find(u => u.id === report.userId);
    const authorEmail = author ? author.email : 'Unknown';

    return `
      <div class="admin-list-item">
        <div class="admin-list-item-top">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">${isLost ? '🔎' : '📦'}</span>
            <div>
              <div style="font-weight: 800; font-size: 14.5px; color: var(--text-primary);">${report.itemName}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${report.category} • ${report.date}</div>
            </div>
          </div>
          <span class="badge ${report.currentStatus === REPORT_STATUS.POTENTIAL_MATCH ? 'badge-match' : report.currentStatus === REPORT_STATUS.RECOVERED ? 'badge-recovered' : 'badge-searching'}">
            ${report.currentStatus}
          </span>
        </div>

        <div style="font-size: 12px; color: var(--text-secondary);">
          <div>📍 <strong>Location:</strong> ${report.location}</div>
          <div>👤 <strong>Reporter:</strong> ${author ? author.name : 'Student'} (${authorEmail})</div>
          ${report.identifyingCharacteristics ? `<div>🏷️ <strong>Marks:</strong> ${report.identifyingCharacteristics}</div>` : ''}
        </div>

        <!-- Status Controller Dropdown & Quick Actions -->
        <div class="admin-action-row">
          ${report.image ? `
            <button class="btn btn-sm btn-secondary btn-inspect-img" data-report-id="${report.id}" style="padding: 4px 8px; font-size: 11px;">
              📷 View Photo
            </button>
          ` : ''}

          <!-- Direct Status Transition Selector -->
          <select class="form-select status-change-select" data-report-id="${report.id}" style="width: auto; padding: 4px 8px; font-size: 11.5px; height: 30px;">
            <option value="SEARCHING" ${report.currentStatus === REPORT_STATUS.SEARCHING ? 'selected' : ''}>Searching</option>
            <option value="UNDER_REVIEW" ${report.currentStatus === REPORT_STATUS.UNDER_REVIEW ? 'selected' : ''}>Under Review</option>
            <option value="POTENTIAL_MATCH" ${report.currentStatus === REPORT_STATUS.POTENTIAL_MATCH ? 'selected' : ''}>Potential Match</option>
            <option value="RECOVERED" ${report.currentStatus === REPORT_STATUS.RECOVERED ? 'selected' : ''}>Mark Recovered ✓</option>
            <option value="RESOLVED" ${report.currentStatus === REPORT_STATUS.RESOLVED ? 'selected' : ''}>Resolved</option>
          </select>

          <button class="btn btn-sm btn-danger btn-delete-report" data-report-id="${report.id}" style="padding: 4px 8px; font-size: 11px;" title="Delete / Inappropriate">
            🗑️
          </button>
        </div>

      </div>
    `;
  }

  bindEvents(container, allReports, users, allMatches) {
    // Search input
    const searchInput = container.querySelector('#admin-lf-search');
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value;
      this.render(container);
    };

    // Filter chips
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.onclick = () => {
        this.activeFilter = chip.dataset.filter;
        this.render(container);
      };
    });

    // Status change listener
    container.querySelectorAll('.status-change-select').forEach(select => {
      select.onchange = async (e) => {
        const reportId = select.dataset.reportId;
        const newStatus = select.value;
        await db.update(DB_STORES.REPORTS, reportId, { currentStatus: newStatus });
        this.app.toast(`Report status updated to ${newStatus}`, 'success');
        this.render(container);
      };
    });

    // Delete report
    container.querySelectorAll('.btn-delete-report').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Are you sure you want to remove this report?')) {
          await db.delete(DB_STORES.REPORTS, btn.dataset.reportId);
          this.app.toast('Report removed from database', 'info');
          this.render(container);
        }
      };
    });

    // Image & detail inspect modal
    const modal = container.querySelector('#admin-detail-modal');
    const modalClose = container.querySelector('#admin-modal-close');
    const modalBody = container.querySelector('#admin-modal-body');

    modalClose.onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };

    container.querySelectorAll('.btn-inspect-img').forEach(btn => {
      btn.onclick = () => {
        const report = allReports.find(r => r.id === btn.dataset.reportId);
        if (!report) return;
        
        modalBody.innerHTML = `
          <div style="text-align: center;">
            <div style="width: 100%; max-height: 260px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 12px; border: 1px solid var(--border-light);">
              <img src="${report.image}" alt="${report.itemName}" style="width: 100%; height: 100%; object-fit: contain; background: #000;">
            </div>
            <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${report.itemName}</h4>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${report.description}</p>
            <div style="margin-top: 12px; padding: 8px 12px; background: var(--bg-card-muted); border-radius: var(--radius-sm); font-size: 11px; color: var(--text-muted);">
              Uploaded by reporter • Stored securely
            </div>
          </div>
        `;
        modal.classList.add('open');
      };
    });
  }
}
