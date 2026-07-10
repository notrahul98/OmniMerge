# 🚀 Deploy OmniMerge to GitHub

## Quick Deploy (Automated)

### Option 1: PowerShell (Windows)

```powershell
.\deploy-to-github.ps1
```

Then enter:
- Your GitHub username
- Your [Personal Access Token](https://github.com/settings/tokens) (with `repo` scope)

### Option 2: Bash (Linux/Mac)

```bash
chmod +x deploy.sh
./deploy.sh
```

Then enter:
- Your GitHub username
- Your [Personal Access Token](https://github.com/settings/tokens) (with `repo` scope)

---

## Manual Deploy (If Scripts Don't Work)

### 1. Create Personal Access Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scope: `repo` (Full control of private repositories)
4. Copy the token

### 2. Push to GitHub

```bash
# Set variables
$GITHUB_USERNAME = "your-username"
$GITHUB_TOKEN = "your-token"

# Configure git
git remote remove origin 2>/dev/null
git remote add origin https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/OmniMerge.git

# Push
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to https://github.com/YOUR_USERNAME/OmniMerge
2. Click **Settings** → **Pages**
3. Set:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/(root)`
4. Click **Save**

---

## After Deployment

### Your Sites Are Live At:
- 🌐 **Landing Page**: `https://YOUR_USERNAME.github.io/OmniMerge/`
- 🧮 **Web App**: `https://YOUR_USERNAME.github.io/OmniMerge/index.html`
- 📖 **GitHub Repo**: `https://github.com/YOUR_USERNAME/OmniMerge`

### Verify Deployment:
1. Wait 1-2 minutes for GitHub Pages to deploy
2. Visit the landing page URL above
3. Click "Launch App" to test the consolidation tool
4. Try uploading a sample Excel file

---

## Troubleshooting

### "Repository already exists"
- The repo `OmniMerge` already exists in your account
- Delete it from GitHub Settings if you want to recreate
- Or push to a different repo name

### "Invalid token"
- Ensure token has `repo` scope
- Token hasn't expired
- No typos in username/token

### "GitHub Pages not deploying"
- Wait 1-2 minutes (can take time)
- Check Settings → Pages to see deployment status
- Ensure branch is set to `main`
- Refresh the browser cache (Ctrl+Shift+Delete)

### "Authentication failed"
- Use Personal Access Token, not password
- Token should start with `ghp_`
- Ensure it's not expired

---

## What Gets Deployed

✅ **Landing Page** (`landing.html`)
- Beautiful marketing site
- Feature showcase
- Call-to-action buttons

✅ **Web Application** (`index.html`)
- Full React consolidation tool
- Works completely offline
- No backend required

✅ **Documentation**
- README.md
- SETUP.md
- CONTRIBUTING.md
- All guides included

✅ **Source Code**
- React components
- TypeScript types
- Utility functions
- Styling

---

## Next Steps After Deployment

1. ✅ Verify site is live
2. ✅ Test with your Tally files
3. ✅ Share the link
4. ✅ Add GitHub topics (Settings → About)
5. ✅ Create GitHub release (v1.0.0)

---

**Questions?** Check the main README.md or SETUP.md
