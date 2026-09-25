/**
 * Student Home View — FIND / Lost & Found Module
 * Hero with 3D/Radar canvas, 2 Action Cards (Report Lost/Found), and My Activity Timeline.
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES, REPORT_TYPES, REPORT_STATUS } from '../db/schema.js';
import { auth } from '../auth/auth-service.js';
import { matchingEngine } from '../services/matching-engine.js';
import { ThreeSceneManager } from '../3d/three-scene.js';
import { RadarScanner } from '../3d/radar-scanner.js';

export class StudentHomeView {
  constructor(app) {
    this.app = app;
    this.threeScene = null;
    this.radarScanner = null;
  }

  async render(container) {
    const user = auth.getCurrentUser();
    const allReports = await db.getAll(DB_STORES.REPORTS);
    const userReports = allReports.filter(r => r.userId === user.id);
    const matches = await db.getAll(DB_STORES.MATCHES);

    container.innerHTML = `
      <div class="student-home-screen" style="padding: 14px 16px 30px;">

        <!-- Top Hero Section (Approx 30% viewport) with 3D WebGL Canvas -->
        <div class="hero-card card card-glass" style="padding: 12px 14px; position: relative; overflow: hidden; margin-bottom: 14px; border: 1.5px solid rgba(37,99,235,0.25);">
          
          <!-- 3D WebGL Shield & Particle Canvas Container -->
          <div id="three-hero-container" style="width: 100%; height: 160px; position: relative; border-radius: var(--radius-md); overflow: hidden; background: radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 90%);">
            <!-- Canvas is mounted here -->
            <div style="position: absolute; bottom: 8px; left: 12px; font-size: 10px; font-weight: 700; color: #93c5fd; background: rgba(15,23,42,0.6); padding: 2px 8px; border-radius: 99px; backdrop-filter: blur(4px);">
              ✨ Interactive 3D Shield
            </div>
          </div>

          <div style="margin-top: 10px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 2px;">
              <span class="badge" style="background: #eff6ff; color: var(--brand-primary); font-size: 10px;">FIND MODULE</span>
              <span style="font-size: 12px; font-weight: 700; color: var(--brand-accent);">“Lost it? Let’s find it.”</span>
            </div>
            <h2 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 3px;">
              Lost something? Found something?
            </h2>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.35;">
              Let’s bring it back where it belongs with automated smart campus matching.
            </p>
          </div>
        </div>

        <!-- Two Prominent Action Cards -->
        <div class="action-cards-grid">
          
          <!-- 🔎 Report Lost Card -->
          <div id="btn-open-report-lost" class="action-card action-card-lost card-3d-interactive">
            <div class="action-card-icon">🔎</div>
            <div class="action-card-title">
              <span>Report Lost</span>
            </div>
            <p class="action-card-desc">Lost your backpack, laptop, ID, or key? Submit details for AI matching.</p>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: var(--brand-primary);">
              Start Report &rarr;
            </div>
          </div>

          <!-- 📦 Report Found Card -->
          <div id="btn-open-report-found" class="action-card action-card-found card-3d-interactive">
            <div class="action-card-icon">📦</div>
            <div class="action-card-title">
              <span>Report Found</span>
            </div>
            <p class="action-card-desc">Found an unattended belonging on campus? Help return it safely.</p>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #b45309;">
              Handover Item &rarr;
            </div>
          </div>

        </div>

        <!-- Active Radar Scanner Animation for Live Campus Searches -->
        <div style="margin: 16px 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Campus Live Radar</span>
            <span style="font-size: 11px; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span> Active Scanning
            </span>
          </div>
          <div class="radar-canvas-container">
            <canvas id="campus-radar-canvas"></canvas>
            <div style="position: absolute; bottom: 8px; font-size: 10px; color: #94a3b8; background: rgba(15,23,42,0.7); padding: 2px 10px; border-radius: 99px;">
              📡 Scanning Central Library • Cafeteria • Lab Blocks
            </div>
          </div>
        </div>

        <!-- MY ACTIVITY SECTION -->
        <div style="margin-top: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary);">My Activity</h3>
              <p style="font-size: 11.5px; color: var(--text-muted);">Track your reported lost & found items and match statuses</p>
            </div>
            <span class="badge" style="background: var(--bg-card-muted); color: var(--text-secondary); font-size: 11px;">
              ${userReports.length} ${userReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </div>

          <!-- Activity List / Empty State -->
          <div class="timeline-list">
            ${userReports.length === 0 ? `
              <div class="empty-state card">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-title">No reports yet</div>
                <div class="empty-state-text">Your Lost & Found activity and smart match notifications will appear here.</div>
                <button id="empty-report-lost-btn" class="btn btn-sm btn-primary" style="margin-top: 8px;">
                  🔎 Report a Lost Item
                </button>
              </div>
            ` : userReports.map(report => this.renderReportCard(report, matches)).join('')}
          </div>
        </div>

      </div>

      <!-- Report Form Modal / Bottom Sheet -->
      <div id="report-modal-overlay" class="modal-overlay">
        <div class="bottom-sheet-content">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 id="modal-form-title" class="sheet-title">Report Lost Item</h3>
            <button id="modal-close-btn" class="sheet-close-btn">✕</button>
          </div>

          <form id="lost-found-form">
            <input type="hidden" id="form-report-type" value="LOST">
            
            <div class="form-group">
              <label class="form-label">Item Name *</label>
              <input type="text" id="form-item-name" class="form-input" placeholder="e.g. Space Grey HP Envy Laptop" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select id="form-category" class="form-select" required>
                  <option value="Electronics">💻 Electronics</option>
                  <option value="ID Cards & Documents">🪪 ID & Documents</option>
                  <option value="Stationery & Books">📚 Books / Stationery</option>
                  <option value="Keys & Wallets">🔑 Keys & Wallets</option>
                  <option value="Clothing & Bags">🎒 Bags / Wearables</option>
                  <option value="Accessories">⌚ Accessories</option>
                  <option value="Other">❓ Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" id="form-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location (Where Lost / Found) *</label>
              <input type="text" id="form-location" class="form-input" placeholder="e.g. Central Library 2nd Floor" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label">Primary Color *</label>
                <input type="text" id="form-color" class="form-input" placeholder="e.g. Space Grey / Black" required>
              </div>

              <div class="form-group">
                <label class="form-label">Characteristics</label>
                <input type="text" id="form-characteristics" class="form-input" placeholder="e.g. Stickers, initials, scratches">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea id="form-description" class="form-textarea" rows="2" placeholder="Provide accurate details to help verify ownership..." required></textarea>
            </div>

            <!-- Optional Image Upload -->
            <div class="form-group">
              <label class="form-label">Attach Photo (Optional)</label>
              <div id="image-upload-trigger" class="file-upload-box">
                <span style="font-size: 20px;">📷</span>
                <p style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">Click to select or paste photo</p>
                <input type="file" id="form-image-input" accept="image/*" style="display: none;">
              </div>
              <div id="form-image-preview" class="image-preview-wrapper" style="display: none;">
                <img id="preview-img-tag" src="" alt="Preview">
                <button type="button" id="remove-img-btn" style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">✕</button>
              </div>
            </div>

            <div id="found-extra-location-group" class="form-group" style="display: none;">
              <label class="form-label">Current Safe Item Location *</label>
              <input type="text" id="form-current-location" class="form-input" placeholder="e.g. Deposited at Dean Office / Library Desk">
            </div>

            <div class="form-group">
              <label class="form-label">Additional Instructions</label>
              <input type="text" id="form-additional-info" class="form-input" placeholder="Any specific handover instructions...">
            </div>

            <button type="submit" id="form-submit-btn" class="btn btn-primary btn-full" style="height: 48px; font-size: 15px; margin-top: 10px;">
              Submit Report & Run Match Engine
            </button>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.init3D(container);
  }

  renderReportCard(report, matches) {
    const isLost = report.type === REPORT_TYPES.LOST;
    
    // Determine status badge class & label
    let badgeClass = 'badge-searching';
    let statusText = 'Searching for Match';
    let stepProgress = '25%';

    if (report.currentStatus === REPORT_STATUS.UNDER_REVIEW) {
      badgeClass = 'badge-review';
      statusText = 'Under Review';
      stepProgress = '50%';
    } else if (report.currentStatus === REPORT_STATUS.POTENTIAL_MATCH) {
      badgeClass = 'badge-match';
      statusText = `Potential Match (${report.matchScore}%)`;
      stepProgress = '75%';
    } else if (report.currentStatus === REPORT_STATUS.RECOVERED || report.currentStatus === REPORT_STATUS.RESOLVED) {
      badgeClass = 'badge-recovered';
      statusText = 'Recovered / Resolved';
      stepProgress = '100%';
    }

    return `
      <div class="timeline-item-card">
        <div class="timeline-item-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">${isLost ? '🔎' : '📦'}</span>
            <div>
              <div class="timeline-item-title">${report.itemName}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${report.category} • Reported on ${report.date}</div>
            </div>
          </div>
          <span class="badge ${badgeClass}">${statusText}</span>
        </div>

        <div class="timeline-meta-row">
          <div class="timeline-meta-item">📍 ${report.location}</div>
          <div class="timeline-meta-item">🎨 ${report.color}</div>
        </div>

        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.4;">
          ${report.description}
        </p>

        <!-- Stepper Timeline -->
        <div style="margin: 6px 0;">
          <div class="stepper-bar">
            <div class="stepper-line">
              <div class="stepper-line-progress" style="width: ${stepProgress};"></div>
            </div>
            <div class="step-node ${report.currentStatus ? 'active' : ''}">1</div>
            <div class="step-node ${report.currentStatus === REPORT_STATUS.UNDER_REVIEW || report.currentStatus === REPORT_STATUS.POTENTIAL_MATCH || report.currentStatus === REPORT_STATUS.RECOVERED ? 'active' : ''}">2</div>
            <div class="step-node ${report.currentStatus === REPORT_STATUS.POTENTIAL_MATCH || report.currentStatus === REPORT_STATUS.RECOVERED ? 'active' : ''}">3</div>
            <div class="step-node ${report.currentStatus === REPORT_STATUS.RECOVERED ? 'completed' : ''}">✓</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 600; color: var(--text-muted); margin-top: 4px;">
            <span>Reported</span>
            <span>Review</span>
            <span>Match</span>
            <span>Recovered</span>
          </div>
        </div>

        <!-- Potential Match Alert Box if Match exists -->
        ${report.currentStatus === REPORT_STATUS.POTENTIAL_MATCH ? `
          <div class="match-callout-box">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="match-score-badge">⚡ ${report.matchScore}% High Match Probability</span>
              <span style="font-size: 10.5px; font-weight: 700; background: #fef08a; padding: 2px 6px; border-radius: 4px; color: #854d0e;">Pending Admin Verification</span>
            </div>
            <p style="font-size: 11.5px; color: #78350f; margin-top: 4px; line-height: 1.35;">
              A matching opposite report has been paired with this item. Our campus administrator is verifying proof of ownership before releasing handover.
            </p>
          </div>
        ` : ''}

        ${report.currentStatus === REPORT_STATUS.RECOVERED ? `
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: var(--radius-md); padding: 8px 12px; font-size: 12px; color: #065f46; font-weight: 600;">
            🎉 Great news! This item has been verified and safely recovered.
          </div>
        ` : ''}

      </div>
    `;
  }

  init3D(container) {
    const heroElem = container.querySelector('#three-hero-container');
    if (heroElem) {
      try {
        this.threeScene = new ThreeSceneManager('three-hero-container');
      } catch (e) {
        console.warn('3D initialization failed, fallback active', e);
      }
    }

    const radarCanvas = container.querySelector('#campus-radar-canvas');
    if (radarCanvas) {
      this.radarScanner = new RadarScanner(radarCanvas);
    }
  }

  bindEvents(container) {
    const modal = container.querySelector('#report-modal-overlay');
    const closeBtn = container.querySelector('#modal-close-btn');
    const form = container.querySelector('#lost-found-form');
    const modalTitle = container.querySelector('#modal-form-title');
    const formType = container.querySelector('#form-report-type');
    const foundExtra = container.querySelector('#found-extra-location-group');
    const imageUploadBox = container.querySelector('#image-upload-trigger');
    const imageInput = container.querySelector('#form-image-input');
    const previewWrapper = container.querySelector('#form-image-preview');
    const previewImg = container.querySelector('#preview-img-tag');
    const removeImgBtn = container.querySelector('#remove-img-btn');

    let uploadedImageBase64 = '';

    const openModal = (type) => {
      formType.value = type;
      if (type === REPORT_TYPES.LOST) {
        modalTitle.textContent = '🔎 Report a Lost Item';
        foundExtra.style.display = 'none';
        container.querySelector('#form-submit-btn').textContent = 'Submit Lost Report';
      } else {
        modalTitle.textContent = '📦 Report a Found Item';
        foundExtra.style.display = 'block';
        container.querySelector('#form-submit-btn').textContent = 'Submit Found Report';
      }
      modal.classList.add('open');
    };

    const closeModal = () => {
      modal.classList.remove('open');
      form.reset();
      uploadedImageBase64 = '';
      previewWrapper.style.display = 'none';
      imageUploadBox.style.display = 'block';
    };

    container.querySelector('#btn-open-report-lost').onclick = () => openModal(REPORT_TYPES.LOST);
    container.querySelector('#btn-open-report-found').onclick = () => openModal(REPORT_TYPES.FOUND);
    
    const emptyBtn = container.querySelector('#empty-report-lost-btn');
    if (emptyBtn) emptyBtn.onclick = () => openModal(REPORT_TYPES.LOST);

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Image Upload Handling with safe DataURL preview
    imageUploadBox.onclick = () => imageInput.click();
    imageInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        this.app.toast('Image must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImageBase64 = evt.target.result;
        previewImg.src = uploadedImageBase64;
        previewWrapper.style.display = 'block';
        imageUploadBox.style.display = 'none';
      };
      reader.readAsDataURL(file);
    };

    removeImgBtn.onclick = () => {
      uploadedImageBase64 = '';
      imageInput.value = '';
      previewWrapper.style.display = 'none';
      imageUploadBox.style.display = 'block';
    };

    // Form Submit
    form.onsubmit = async (e) => {
      e.preventDefault();
      const user = auth.getCurrentUser();
      const type = formType.value;
      const itemName = container.querySelector('#form-item-name').value.trim();
      const category = container.querySelector('#form-category').value;
      const date = container.querySelector('#form-date').value;
      const location = container.querySelector('#form-location').value.trim();
      const color = container.querySelector('#form-color').value.trim();
      const identifyingCharacteristics = container.querySelector('#form-characteristics').value.trim();
      const description = container.querySelector('#form-description').value.trim();
      const additionalInfo = container.querySelector('#form-additional-info').value.trim();

      const newReportData = {
        userId: user.id,
        type,
        itemName,
        category,
        date,
        location,
        color,
        identifyingCharacteristics,
        description,
        additionalInfo,
        image: uploadedImageBase64 || (type === REPORT_TYPES.LOST 
          ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80' 
          : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80'),
        currentStatus: REPORT_STATUS.SEARCHING,
        matchScore: 0
      };

      try {
        const createdReport = await db.create(DB_STORES.REPORTS, newReportData);
        closeModal();
        this.app.toast(`${type === REPORT_TYPES.LOST ? 'Lost' : 'Found'} report submitted! Running AI matching...`, 'info');

        // Run smart matching algorithm asynchronously
        const matchResult = await matchingEngine.processReport(createdReport);
        if (matchResult.matched) {
          this.app.toast(`🎉 Potential Match Found! Similarity: ${matchResult.score}%`, 'success');
        } else {
          this.app.toast(`Report active in campus search feed.`, 'success');
        }

        // Re-render view
        this.render(container);
      } catch (err) {
        this.app.toast(err.message, 'error');
      }
    };
  }
}
