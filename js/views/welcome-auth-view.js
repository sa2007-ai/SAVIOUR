/**
 * Welcome & Dual Role Authentication View (Student & Admin)
 * Validates '2' prefix for students and '3' prefix for admins with live feedback.
 */

import { auth } from '../auth/auth-service.js';
import { ROLES } from '../db/schema.js';

export class WelcomeAuthView {
  constructor(app) {
    this.app = app;
    this.activeRole = ROLES.STUDENT;
    this.authMode = 'login'; // 'login' or 'register'
  }

  render(container) {
    container.innerHTML = `
      <div class="welcome-auth-screen" style="padding: 24px 20px; min-height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
        
        <!-- Brand Header Section -->
        <div style="text-align: center; margin-top: 10px;">
          <div style="width: 84px; height: 84px; margin: 0 auto 14px; position: relative;" class="animate-float">
            <img src="./assets/logo.svg" alt="SAVIOUR Logo" style="width: 100%; height: 100%; filter: drop-shadow(0 10px 15px rgba(37,99,235,0.3));">
          </div>
          <h1 style="font-size: 28px; font-weight: 800; color: var(--brand-primary); letter-spacing: -0.8px; margin-bottom: 2px;">SAVIOUR</h1>
          <p style="font-size: 13px; font-weight: 700; color: var(--brand-accent); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px;">Find. Report. Get Help.</p>
          <p style="font-size: 13px; color: var(--text-secondary); max-width: 290px; margin: 0 auto; line-height: 1.4;">
            One smart place for finding lost items, reporting campus issues, and getting help when you need it.
          </p>
        </div>

        <!-- Role Selector Switch -->
        <div style="margin: 20px 0 14px;">
          <div style="display: flex; background: var(--bg-card-muted); padding: 4px; border-radius: var(--radius-full); border: 1px solid var(--border-light);">
            <button id="role-student-btn" class="btn btn-sm ${this.activeRole === ROLES.STUDENT ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; border-radius: var(--radius-full); border: none; font-size: 13px;">
              🧑‍🎓 Student Portal
            </button>
            <button id="role-admin-btn" class="btn btn-sm ${this.activeRole === ROLES.ADMIN ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; border-radius: var(--radius-full); border: none; font-size: 13px;">
              🛡️ Admin Access
            </button>
          </div>
          
          <!-- Role Rule Notice -->
          <div id="role-rule-notice" style="margin-top: 8px; text-align: center; font-size: 11.5px; color: var(--text-secondary); background: ${this.activeRole === ROLES.STUDENT ? '#eff6ff' : '#fef3c7'}; padding: 6px 12px; border-radius: var(--radius-sm); border: 1px dashed ${this.activeRole === ROLES.STUDENT ? '#93c5fd' : '#fde68a'};">
            ${this.activeRole === ROLES.STUDENT 
              ? '📌 <strong>Student Rule:</strong> Email address must start with <strong>2</strong> (e.g. 21cse042@college.edu)' 
              : '🔑 <strong>Admin Rule:</strong> Official email must start with <strong>3</strong> (e.g. 3001admin@college.edu)'}
          </div>
        </div>

        <!-- Auth Form Card -->
        <div class="card card-glass" style="padding: 20px; box-shadow: var(--shadow-lg);">
          
          <!-- Tab Toggle (Login vs Register) -->
          <div style="display: flex; border-bottom: 2px solid var(--border-light); margin-bottom: 18px;">
            <button id="tab-login" style="flex: 1; padding: 10px; background: none; border: none; font-weight: 700; font-size: 14px; cursor: pointer; color: ${this.authMode === 'login' ? 'var(--brand-primary)' : 'var(--text-muted)'}; border-bottom: 2px solid ${this.authMode === 'login' ? 'var(--brand-primary)' : 'transparent'}; margin-bottom: -2px;">
              Sign In
            </button>
            <button id="tab-register" style="flex: 1; padding: 10px; background: none; border: none; font-weight: 700; font-size: 14px; cursor: pointer; color: ${this.authMode === 'register' ? 'var(--brand-primary)' : 'var(--text-muted)'}; border-bottom: 2px solid ${this.authMode === 'register' ? 'var(--brand-primary)' : 'transparent'}; margin-bottom: -2px;">
              Sign Up
            </button>
          </div>

          <form id="auth-form">
            <!-- Full Name (Register Only) -->
            ${this.authMode === 'register' ? `
              <div class="form-group">
                <label class="form-label">${this.activeRole === ROLES.STUDENT ? 'Full Name' : 'Admin Name'}</label>
                <input type="text" id="auth-name" class="form-input" placeholder="${this.activeRole === ROLES.STUDENT ? 'e.g. Aarav Sharma' : 'e.g. Dr. Ramesh Kumar'}" required>
              </div>
            ` : ''}

            <!-- Email Field with live prefix validation indicator -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label">${this.activeRole === ROLES.STUDENT ? 'Gmail / College Email' : 'Official Admin Email'}</label>
                <span id="prefix-indicator" style="font-size: 11px; font-weight: 700;"></span>
              </div>
              <input type="email" id="auth-email" class="form-input" placeholder="${this.activeRole === ROLES.STUDENT ? '2xxxx@college.edu' : '3xxxx@college.edu'}" required autocomplete="email">
              <span id="email-error-text" class="form-error-msg" style="display: none;"></span>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label class="form-label">Password</label>
              <div style="position: relative;">
                <input type="password" id="auth-password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" id="toggle-password-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px;">👁️</button>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="auth-submit-btn" class="btn btn-primary btn-full" style="margin-top: 10px; height: 46px; font-size: 15px;">
              ${this.authMode === 'login' ? 'Sign In to ' + (this.activeRole === ROLES.STUDENT ? 'Student' : 'Admin') : 'Create ' + (this.activeRole === ROLES.STUDENT ? 'Student' : 'Admin') + ' Account'}
            </button>
          </form>

          <!-- Demo Quick Logins for Instant Evaluation -->
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border-light); text-align: center;">
            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">⚡ Quick Demo One-Click Login:</p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button id="quick-student-login" class="btn btn-sm btn-secondary" style="font-size: 11px; padding: 5px 10px;">
                Demo Student (21cse042)
              </button>
              <button id="quick-admin-login" class="btn btn-sm btn-secondary" style="font-size: 11px; padding: 5px 10px;">
                Demo Admin (3001admin)
              </button>
            </div>
          </div>

        </div>

        <!-- Footer Caption -->
        <div style="text-align: center; margin-top: 16px; font-size: 11px; color: var(--text-muted);">
          SAVIOUR Campus Assistance • Secure Multi-Role Portal
        </div>

      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    // Role switchers
    const studentBtn = container.querySelector('#role-student-btn');
    const adminBtn = container.querySelector('#role-admin-btn');
    const tabLogin = container.querySelector('#tab-login');
    const tabRegister = container.querySelector('#tab-register');
    const authForm = container.querySelector('#auth-form');
    const emailInput = container.querySelector('#auth-email');
    const prefixIndicator = container.querySelector('#prefix-indicator');
    const emailErrorText = container.querySelector('#email-error-text');
    const passwordInput = container.querySelector('#auth-password');
    const togglePassBtn = container.querySelector('#toggle-password-btn');

    studentBtn.onclick = () => {
      this.activeRole = ROLES.STUDENT;
      this.render(container);
    };

    adminBtn.onclick = () => {
      this.activeRole = ROLES.ADMIN;
      this.render(container);
    };

    tabLogin.onclick = () => {
      this.authMode = 'login';
      this.render(container);
    };

    tabRegister.onclick = () => {
      this.authMode = 'register';
      this.render(container);
    };

    togglePassBtn.onclick = () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassBtn.textContent = '🙈';
      } else {
        passwordInput.type = 'password';
        togglePassBtn.textContent = '👁️';
      }
    };

    // Live Email Prefix Validator
    emailInput.oninput = () => {
      const val = emailInput.value.trim();
      if (!val) {
        prefixIndicator.innerHTML = '';
        emailInput.classList.remove('error');
        emailErrorText.style.display = 'none';
        return;
      }

      if (this.activeRole === ROLES.STUDENT) {
        if (val.startsWith('2')) {
          prefixIndicator.innerHTML = '<span style="color: #10b981;">✓ Valid Student Prefix (2...)</span>';
          emailInput.classList.remove('error');
          emailErrorText.style.display = 'none';
        } else {
          prefixIndicator.innerHTML = '<span style="color: #ef4444;">✗ Must start with "2"</span>';
          emailInput.classList.add('error');
          emailErrorText.style.display = 'block';
          emailErrorText.textContent = 'Student email must begin with digit "2"';
        }
      } else {
        if (val.startsWith('3')) {
          prefixIndicator.innerHTML = '<span style="color: #10b981;">✓ Valid Admin Prefix (3...)</span>';
          emailInput.classList.remove('error');
          emailErrorText.style.display = 'none';
        } else {
          prefixIndicator.innerHTML = '<span style="color: #ef4444;">✗ Must start with "3"</span>';
          emailInput.classList.add('error');
          emailErrorText.style.display = 'block';
          emailErrorText.textContent = 'Admin email must begin with digit "3"';
        }
      }
    };

    // Form Submit
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const nameInput = container.querySelector('#auth-name');
      const name = nameInput ? nameInput.value.trim() : '';

      try {
        if (this.authMode === 'login') {
          await auth.login({ email, password, expectedRole: this.activeRole });
          this.app.toast(`Welcome back, ${auth.getCurrentUser().name}!`, 'success');
        } else {
          if (this.activeRole === ROLES.STUDENT) {
            await auth.registerStudent({ name, email, password });
          } else {
            await auth.registerAdmin({ name, email, password });
          }
          this.app.toast(`Account created successfully!`, 'success');
        }
        this.app.onAuthSuccess();
      } catch (err) {
        this.app.toast(err.message, 'error');
      }
    };

    // Quick demo buttons
    container.querySelector('#quick-student-login').onclick = async () => {
      emailInput.value = '21cse042@college.edu';
      passwordInput.value = 'student123';
      this.activeRole = ROLES.STUDENT;
      studentBtn.click();
      setTimeout(async () => {
        try {
          await auth.login({ email: '21cse042@college.edu', password: 'password', expectedRole: ROLES.STUDENT });
          this.app.toast(`Logged in as Student Aarav Sharma`, 'success');
          this.app.onAuthSuccess();
        } catch (e) {
          this.app.toast(e.message, 'error');
        }
      }, 50);
    };

    container.querySelector('#quick-admin-login').onclick = async () => {
      emailInput.value = '3001admin@college.edu';
      passwordInput.value = 'admin123';
      this.activeRole = ROLES.ADMIN;
      adminBtn.click();
      setTimeout(async () => {
        try {
          await auth.login({ email: '3001admin@college.edu', password: 'password', expectedRole: ROLES.ADMIN });
          this.app.toast(`Logged in as Admin Dr. Ramesh Kumar`, 'success');
          this.app.onAuthSuccess();
        } catch (e) {
          this.app.toast(e.message, 'error');
        }
      }, 50);
    };
  }
}
