#!/bin/bash

# OmniMerge - Deploy to GitHub
# This script creates a GitHub repo, pushes code, and enables GitHub Pages

echo "╔════════════════════════════════════════╗"
echo "║  OmniMerge - GitHub Deployment Script  ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get GitHub token
read -sp "Enter your GitHub Personal Access Token (from https://github.com/settings/tokens): " GITHUB_TOKEN
echo ""

REPO_NAME="OmniMerge"
REPO_DESCRIPTION="Offline web app for consolidating Tally trial balances from multiple companies. No backend. No data sharing. 100% private."

echo ""
echo "Step 1: Creating GitHub Repository..."

# Create repository using GitHub API
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"$REPO_DESCRIPTION\",\"private\":false,\"auto_init\":false}")

# Check if repo was created
if echo "$RESPONSE" | grep -q "\"id\""; then
  echo "✅ Repository created successfully!"
  echo "   Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
  echo "❌ Error creating repository"
  echo "Possible causes:"
  echo "  - Invalid GitHub token"
  echo "  - Repository already exists"
  echo "  - Token doesn't have 'repo' scope"
  echo ""
  echo "Response: $RESPONSE"
  exit 1
fi

echo ""
echo "Step 2: Pushing code to GitHub..."

REPO_URL="https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Configure git and push
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
  echo "✅ Code pushed successfully!"
else
  echo "❌ Error pushing code"
  exit 1
fi

echo ""
echo "Step 3: Enabling GitHub Pages..."

# Enable GitHub Pages
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/pages \
  -d "{\"source\":{\"branch\":\"main\",\"path\":\"/\"}}" > /dev/null

echo "✅ GitHub Pages enabled!"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✅ Deployment Complete!              ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Your sites are live at:"
echo "  🌐 Landing Page: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo "  🧮 Web App: https://$GITHUB_USERNAME.github.io/$REPO_NAME/index.html"
echo "  📖 GitHub Repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Note: GitHub Pages may take 1-2 minutes to deploy."
echo ""
