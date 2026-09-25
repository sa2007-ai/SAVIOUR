<![CDATA[# 🛡️ SAVIOUR — Smart Campus Assistance & Support Platform

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-orange)
![PWA Ready](https://img.shields.io/badge/Mobile--First-360px-blueviolet)

**"Find. Report. Get Help."**

*One smart place for finding lost items, reporting campus issues, and getting help when you need it.*

[🌐 Live Demo](#quick-start) · [🎮 3D Model](#3d-interactive-model) · [🧪 Test Suite](#testing) · [📖 Architecture](#architecture)

</div>

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🔎 **Lost & Found** | Report lost/found items with photo upload, AI-powered matching |
| 📢 **Campus Issue Reporter** | Route issues to the right department via pre-filled mailto |
| 🚨 **Emergency Assistance** | One-touch call & email to 6 campus emergency teams |
| 🛡️ **Role-Based Access** | Separate Student & Admin portals with email-prefix RBAC |
| 🤖 **Smart Matching Engine** | Weighted similarity algorithm (60% threshold) for auto-matching |
| 📊 **Admin Dashboard** | Real-time dynamic metrics across 7 report categories |
| 🌐 **3D Interactive Model** | Full Three.js WebGL showcase of the entire platform |
| 🎨 **Dark / Light Mode** | Full theme switching with CSS custom properties |

---

## 🚀 Architecture — 3 Levels

### Level 1 · Frontend & Mobile-First UI/UX

- **Mobile-First Container** — optimized for 360–430 px, responsive desktop frame
- **Student Portal** — 4-tab navigation: Find · Report · Help · Profile
- **Admin Portal** — 5-tab management: Dashboard · Lost&Found · Departments · Emergency · Settings
- **3D WebGL Hero** — interactive Three.js shield with mouse & gyroscope tracking

### Level 2 · Backend, Database & Security

- **RBAC Email Rules** — Student emails must start with `2`, Admin with `3`
- **SHA-256 + Salt** — passwords never stored in plain text
- **IndexedDB Storage Engine** — persistent reactive local database with full CRUD
- **Smart Matching Engine** — multi-factor weighted scoring across 6 dimensions
- **Single Department Email Model** — one address cascades across all 4 academic years

### Level 3 · 3D Animated Website & WebGL

- **Interactive Three.js Shield** — pointer + gyroscope tracking with `MeshPhysicalMaterial`
- **Ambient Particle Field** — 40+ floating crystal particles with depth
- **Campus Radar Scanner** — canvas 2D sweep effect for active item search visualization
- **3D Model Showcase** — full phone model + 6 floating feature panels + orbit controls

---

## 📂 Project Structure

```
saviour/
├── index.html                    # SPA entry point
├── 3d-model.html                 # 3D interactive showcase
├── test.html                     # Automated browser test runner
├── test-suite.js                 # Programmatic unit & logic tests
├── server.ps1                    # PowerShell local HTTP server
├── push-to-github.ps1            # GitHub push helper script
├── css/
│   ├── design-tokens.css         # Palette, typography, dark/light theme variables
│   ├── main.css                  # Mobile shell, header, bottom nav
│   ├── components.css            # Buttons, cards, form inputs, badges
│   ├── animations.css            # Keyframe micro-animations, radar, 3D tilts
│   └── admin.css                 # Admin metrics dashboard, tables, filter chips
├── js/
│   ├── app.js                    # Application coordinator & SPA router
│   ├── db/
│   │   ├── schema.js             # DB constants & enums
│   │   ├── seed-data.js          # Pre-seeded demo users, departments, reports
│   │   └── storage-engine.js     # Reactive IndexedDB engine
│   ├── auth/
│   │   ├── auth-service.js       # Hashing, prefix validation, sessions
│   │   └── rbac.js               # Role authorization guards
│   ├── services/
│   │   ├── matching-engine.js    # 60% threshold similarity comparison
│   │   ├── department-service.js # Email cascade & mailto dispatcher
│   │   ├── emergency-service.js  # Emergency contact list & calling
│   │   └── notification-service.js # In-app notification dispatcher
│   ├── 3d/
│   │   ├── three-scene.js        # Three.js WebGL Shield & Particle Canvas
│   │   └── radar-scanner.js      # Campus radar sweep animation
│   └── views/
│       ├── welcome-auth-view.js
│       ├── student-home-view.js
│       ├── student-report-view.js
│       ├── student-help-view.js
│       ├── student-profile-view.js
│       ├── admin-dashboard-view.js
│       ├── admin-lostfound-view.js
│       ├── admin-department-view.js
│       ├── admin-emergency-view.js
│       └── admin-settings-view.js
└── assets/
    └── logo.svg                  # SAVIOUR brand logo
```

---

## ⚡ Quick Start

### Option 1 — PowerShell Server (Recommended)

```powershell
# From the project directory:
powershell -ExecutionPolicy Bypass -File server.ps1
```

Then open your browser:

| Page | URL |
|---|---|
| 🏠 Main App | http://localhost:5500/ |
| 🌐 3D Model | http://localhost:5500/3d-model.html |
| 🧪 Test Suite | http://localhost:5500/test.html |

### Option 2 — VS Code Live Server

Install the **Live Server** extension in VS Code, right-click `index.html` → **Open with Live Server**.

### Option 3 — Any static file server

```bash
# Python 3
python -m http.server 5500

# npx serve
npx serve . -p 5500
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Rule |
|---|---|---|---|
| 🧑‍🎓 **Student** | `21cse042@college.edu` | `student123` | Starts with **2** ✓ |
| 🛡️ **Admin** | `3001admin@college.edu` | `admin123` | Starts with **3** ✓ |

> One-click **Quick Demo Login** buttons are available on the login screen.

---

## 🤖 Smart Matching Engine

The Lost & Found matching engine uses a **weighted multi-factor similarity score**:

| Factor | Weight |
|---|---|
| Item Name (fuzzy) | 30% |
| Category | 20% |
| Color & Characteristics | 20% |
| Description | 10% |
| Location proximity | 10% |
| Date proximity | 10% |

Items scoring **≥ 60%** are flagged as **Potential Matches** and notify the admin for verification.

---

## 🎮 3D Interactive Model

Open [`3d-model.html`](./3d-model.html) for a full Three.js 3D showcase:

- 🖱️ **Drag** — orbit around the 3D scene
- 🔍 **Scroll** — zoom in / out
- `R` — reset camera
- `A` — toggle auto-rotate
- **Right panel buttons** — fly camera to each feature

---

## 🧪 Testing

Open `http://localhost:5500/test.html` to run the automated programmatic test suite covering:

- ✅ Email prefix validation rules (Student `2...`, Admin `3...`)
- ✅ Department single-email cascade model
- ✅ Smart matching engine ≥ 60% threshold
- ✅ Emergency services data integrity
- ✅ Dynamic DB statistics computation

---

## 🚀 Deploy to GitHub Pages

1. Push to GitHub (see below)
2. Go to your repo → **Settings** → **Pages**
3. Set **Source** to `main` branch, `/ (root)`
4. Your site will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

---

## 📤 Push to GitHub

1. **Install Git** — https://git-scm.com/download/win
2. **Create an empty repo** on GitHub (no README, no .gitignore)
3. Edit [`push-to-github.ps1`](./push-to-github.ps1) — set your username & repo name
4. Run:

```powershell
powershell -ExecutionPolicy Bypass -File push-to-github.ps1
```

---

## 🔐 Security Notes

- Passwords hashed with **SHA-256 + salt** via `crypto.subtle`
- Email prefix rules enforced on **both frontend and backend service layer**
- All data stored in **browser IndexedDB** — no external servers, no data leaves the device
- Admin verification required before any Lost & Found handover

---

## 📄 License

MIT — feel free to fork, modify, and deploy for your campus!

---

<div align="center">
  Made with ❤️ · SAVIOUR Campus Platform · 2026
</div>
]]>
