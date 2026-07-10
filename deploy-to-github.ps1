# OmniMerge - Deploy to GitHub
# This script creates a GitHub repo, pushes code, and enables GitHub Pages

param(
    [string]$GitHubUsername = "",
    [string]$GitHubToken = ""
)

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  OmniMerge - GitHub Deployment Script  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get username if not provided
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

if (-not $GitHubToken) {
    $GitHubToken = Read-Host "Enter your GitHub Personal Access Token (from https://github.com/settings/tokens)" -AsSecureString
    $GitHubToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($GitHubToken))
}

$RepoName = "OmniMerge"
$RepoDescription = "Offline web app for consolidating Tally trial balances from multiple companies. No backend. No data sharing. 100% private."

Write-Host ""
Write-Host "Step 1: Creating GitHub Repository..." -ForegroundColor Yellow

# Create repository using GitHub API
$Headers = @{
    "Authorization" = "Bearer $GitHubToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$Body = @{
    name = $RepoName
    description = $RepoDescription
    private = $false
    auto_init = $false
} | ConvertTo-Json

try {
    $RepoResponse = Invoke-RestMethod -Method POST -Uri "https://api.github.com/user/repos" `
        -Headers $Headers -Body $Body

    Write-Host "✅ Repository created successfully!" -ForegroundColor Green
    Write-Host "   Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error creating repository: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "- Invalid GitHub token" -ForegroundColor Yellow
    Write-Host "- Repository already exists" -ForegroundColor Yellow
    Write-Host "- Token doesn't have 'repo' scope" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Pushing code to GitHub..." -ForegroundColor Yellow

$ProjectPath = Get-Location
$RepoUrl = "https://$GitHubUsername`:$GitHubToken@github.com/$GitHubUsername/$RepoName.git"

try {
    # Configure git for this push
    git remote remove origin 2>&1 | Out-Null
    git remote add origin $RepoUrl

    # Push code
    git branch -M main
    git push -u origin main -q

    Write-Host "✅ Code pushed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error pushing code: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Enabling GitHub Pages..." -ForegroundColor Yellow

try {
    $PagesBody = @{
        source = @{
            branch = "main"
            path = "/"
        }
    } | ConvertTo-Json

    Invoke-RestMethod -Method POST `
        -Uri "https://api.github.com/repos/$GitHubUsername/$RepoName/pages" `
        -Headers $Headers -Body $PagesBody | Out-Null

    Write-Host "✅ GitHub Pages enabled!" -ForegroundColor Green
}
catch {
    # Pages might already be enabled or endpoint might work differently
    Write-Host "⚠️  Note: GitHub Pages setup may need manual verification" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Deployment Complete!              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your sites are live at:" -ForegroundColor Cyan
Write-Host "  🌐 Landing Page: https://$GitHubUsername.github.io/$RepoName/" -ForegroundColor Cyan
Write-Host "  🧮 Web App: https://$GitHubUsername.github.io/$RepoName/index.html" -ForegroundColor Cyan
Write-Host "  📖 GitHub Repo: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: GitHub Pages may take 1-2 minutes to deploy." -ForegroundColor Yellow
Write-Host ""
