# Pushing to GitHub

## Quick Start (3 Steps)

### 1. Create Repository on GitHub

Go to [https://github.com/new](https://github.com/new) and:
- **Repository name**: `tally-consolidation-tool`
- **Description**: Offline web app for consolidating Tally trial balances from multiple companies
- **Visibility**: Public (recommended for portfolio) or Private
- **Initialize**: Leave unchecked (we already have git locally)
- Click **Create repository**

### 2. Add Remote & Push

Copy one of the URLs from your new GitHub repo:

**Using HTTPS (simpler, needs token):**
```bash
cd artifacts/consolidation-tool

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/tally-consolidation-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Using SSH (requires SSH key setup):**
```bash
git remote add origin git@github.com:YOUR_USERNAME/tally-consolidation-tool.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages (for Landing Page)

The landing page HTML is in the root. To make it accessible:

1. Go to your GitHub repo → **Settings**
2. Click **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: main, folder: /(root)
   - Click **Save**
4. Your site will be live at: `https://YOUR_USERNAME.github.io/tally-consolidation-tool/`

---

## Troubleshooting

### "fatal: remote origin already exists"
```bash
git remote remove origin
# Then re-run the git remote add command
```

### Authentication Failed (HTTPS)
Use a [Personal Access Token](https://github.com/settings/tokens):
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when git asks

### "Updates were rejected"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## After Pushing

### Useful Next Steps

1. **Add Topics** (helps discoverability)
   - Settings → About → Add topics
   - Suggested: `tally`, `consolidation`, `accounting`, `excel`, `finance`

2. **Enable Discussions** (for user feedback)
   - Settings → Features → Check "Discussions"

3. **Add License** (MIT or Apache 2.0 recommended)
   - Add LICENSE file to root

4. **Create Releases** (when you tag versions)
   ```bash
   git tag -a v1.0.0 -m "First release"
   git push origin v1.0.0
   ```

5. **Setup GitHub Actions** (optional, for automated testing)
   - See `.github/workflows` examples

---

## Repository Structure for GitHub

Your repo will have:

```
tally-consolidation-tool/
├── src/                    # Source code
├── index.html             # Landing page
├── package.json           # Dependencies
├── README.md              # User guide
├── SETUP.md               # Setup instructions
├── LICENSE                # License file (optional)
└── .github/
    └── workflows/         # CI/CD workflows (optional)
```

---

## Making Your Repo Discoverable

### Add to README badges:
```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
```

### Share on:
- Dev.to
- Hacker News
- Product Hunt
- Reddit (r/webdev, r/javascript)
- Twitter/LinkedIn

---

## Questions?

If authentication fails, you can also:
1. Use **GitHub Desktop** app (GUI)
2. Use **VS Code** built-in git
3. Contact GitHub support

**You're all set!** Once pushed, your consolidation tool will be live on GitHub. 🚀
