# Deployment Guide

## Deploy to Vercel

### Step 1: Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### Step 2: Push to GitHub
1. Initialize git repository if you haven't:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub (e.g., `github-stats-card`)

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/github-stats-card.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Website (Easiest)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `github-stats-card` repository
5. Configure environment variables:
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `GITHUB_USERNAME`: Your GitHub username (nivobi)
6. Click "Deploy"

#### Option B: Via CLI
```bash
vercel
# Follow the prompts
# Add environment variables when asked:
# - GITHUB_TOKEN
# - GITHUB_USERNAME
```

### Step 4: Set Environment Variables
In your Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - **Name**: `GITHUB_TOKEN`, **Value**: `your_github_personal_access_token`
   - **Name**: `GITHUB_USERNAME`, **Value**: `your_github_username`

### Step 5: Get Your Card URL
After deployment, your card will be available at:
```
https://YOUR-PROJECT-NAME.vercel.app/api/card
```

## Add to GitHub Profile

### Step 1: Create Profile README
1. Create a repository named exactly the same as your username: `nivobi`
2. Create a `README.md` file in it

### Step 2: Add the Card
Add this to your `README.md`:

```markdown
![GitHub Stats Card](https://YOUR-PROJECT-NAME.vercel.app/api/card)
```

Or with a link:
```markdown
[![GitHub Stats Card](https://YOUR-PROJECT-NAME.vercel.app/api/card)](https://github.com/nivobi)
```

### Example README.md
```markdown
# Hi, I'm Nivobi! 👋

![GitHub Stats Card](https://YOUR-PROJECT-NAME.vercel.app/api/card)

## About Me
Software developer passionate about building cool things!
```

## Updating the Card
When you push changes to your GitHub repository, Vercel will automatically redeploy your card!

## Troubleshooting

### Card not loading?
- Check Vercel logs: Dashboard → Your Project → Logs
- Verify environment variables are set correctly
- Make sure your GitHub token has the right permissions

### Token expired?
Generate a new GitHub Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `read:user` and `repo` scopes
3. Update in Vercel environment variables
