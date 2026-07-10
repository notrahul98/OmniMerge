# Quick Start - Push to GitHub in 5 Minutes

## Step 1️⃣: Create GitHub Repo (2 min)

1. Go to https://github.com/new
2. Enter:
   - **Name**: `tally-consolidation-tool`
   - **Description**: `Offline tool for consolidating Tally trial balances`
   - **Visibility**: Public
3. Click **Create repository**
4. **Copy the HTTPS URL** from the next page (e.g., `https://github.com/YOUR_USERNAME/tally-consolidation-tool.git`)

---

## Step 2️⃣: Push Code (2 min)

```bash
# Navigate to project
cd artifacts/consolidation-tool

# Add GitHub remote (paste YOUR URL from step 1)
git remote add origin https://github.com/YOUR_USERNAME/tally-consolidation-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**When asked for password:**
- Username: Your GitHub username
- Password: [Create Personal Access Token](https://github.com/settings/tokens) → use token as password

---

## Step 3️⃣: Enable GitHub Pages (1 min)

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Set:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/(root)`
4. Click **Save**

---

## ✅ Done! Your App is Live!

Access at:
```
https://YOUR_USERNAME.github.io/tally-consolidation-tool/landing.html
```

(Or just use `/index.html` to launch the app directly)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "remote origin already exists" | Run: `git remote remove origin` then retry |
| Authentication fails | Use [Personal Access Token](https://github.com/settings/tokens) |
| Pages not loading | Wait 1-2 minutes and clear browser cache |

---

**That's it!** Your consolidation tool is now on GitHub with a beautiful landing page. 🎉
