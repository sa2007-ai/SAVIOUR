# ═══════════════════════════════════════════════════════════════
#  SAVIOUR — GitHub Push Helper Script
#  Usage: powershell -ExecutionPolicy Bypass -File push-to-github.ps1
#  
#  BEFORE RUNNING:
#    1. Install Git for Windows: https://git-scm.com/download/win
#    2. Create a new EMPTY repo on GitHub (no README, no .gitignore)
#    3. Set your GitHub username and repo name below
# ═══════════════════════════════════════════════════════════════

# ── CONFIGURE THESE ─────────────────────────────────────────────
$GithubUsername  = "YOUR_GITHUB_USERNAME"    # e.g. "gopir"
$RepoName        = "saviour-campus-platform"  # your GitHub repo name
$CommitMessage   = "🛡️ Initial commit — SAVIOUR Smart Campus Platform"
$Branch          = "main"
# ────────────────────────────────────────────────────────────────

$RepoUrl = "https://github.com/$GithubUsername/$RepoName.git"

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🛡️  SAVIOUR — GitHub Push Helper" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check git is installed
try {
    $gitVer = git --version 2>&1
    Write-Host "✅  Git found: $gitVer" -ForegroundColor Green
} catch {
    Write-Host "❌  Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "    Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Validate config
if ($GithubUsername -eq "YOUR_GITHUB_USERNAME") {
    Write-Host "❌  Please edit push-to-github.ps1 and set your GitHub username first!" -ForegroundColor Red
    exit 1
}

Write-Host "📦  Target repo : $RepoUrl" -ForegroundColor White
Write-Host "🌿  Branch       : $Branch" -ForegroundColor White
Write-Host ""

# ── Step 1: Initialize git repo ─────────────────────────────────
if (-not (Test-Path ".git")) {
    Write-Host "⚙️   Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅  Git repo initialized." -ForegroundColor Green
} else {
    Write-Host "ℹ️   Git repo already initialized." -ForegroundColor Cyan
}

# ── Step 2: Set default branch to main ──────────────────────────
git checkout -b $Branch 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout $Branch 2>$null
}

# ── Step 3: Configure user (prompts if not set) ──────────────────
$existingName = git config user.name 2>$null
$existingEmail = git config user.email 2>$null

if (-not $existingName) {
    $userName = Read-Host "Enter your Git display name (e.g. Gopir)"
    git config user.name $userName
}
if (-not $existingEmail) {
    $userEmail = Read-Host "Enter your GitHub email address"
    git config user.email $userEmail
}

Write-Host "✅  Git user : $(git config user.name) <$(git config user.email)>" -ForegroundColor Green

# ── Step 4: Stage all files ──────────────────────────────────────
Write-Host ""
Write-Host "📁  Staging all project files..." -ForegroundColor Yellow
git add .
Write-Host "✅  Files staged." -ForegroundColor Green

# ── Step 5: Commit ───────────────────────────────────────────────
Write-Host ""
Write-Host "💬  Creating commit..." -ForegroundColor Yellow
git commit -m $CommitMessage
Write-Host "✅  Commit created." -ForegroundColor Green

# ── Step 6: Add remote ───────────────────────────────────────────
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "ℹ️   Remote 'origin' already set to: $existingRemote" -ForegroundColor Cyan
    Write-Host "    Updating to: $RepoUrl" -ForegroundColor Yellow
    git remote set-url origin $RepoUrl
} else {
    Write-Host ""
    Write-Host "🔗  Adding remote origin..." -ForegroundColor Yellow
    git remote add origin $RepoUrl
}
Write-Host "✅  Remote origin set." -ForegroundColor Green

# ── Step 7: Push ─────────────────────────────────────────────────
Write-Host ""
Write-Host "🚀  Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "    (A browser window or credential prompt may open for login)" -ForegroundColor Gray
Write-Host ""

git push -u origin $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  🎉  SUCCESS! SAVIOUR is now on GitHub!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🔗  View your repo at:" -ForegroundColor White
    Write-Host "      https://github.com/$GithubUsername/$RepoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  🌐  To deploy as a live site (GitHub Pages):" -ForegroundColor White
    Write-Host "      Repo → Settings → Pages → Branch: main → / (root)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌  Push failed. Common fixes:" -ForegroundColor Red
    Write-Host "    • Make sure the GitHub repo exists and is EMPTY" -ForegroundColor Yellow
    Write-Host "    • Make sure your username/token has push access" -ForegroundColor Yellow
    Write-Host "    • Try: git push -u origin main --force" -ForegroundColor Yellow
    Write-Host ""
}
