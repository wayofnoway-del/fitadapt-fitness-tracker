# FitAdapt Project - Setup and Deployment Guide

## Project Overview

This is a **React + TypeScript + Vite** fitness tracker application with **Supabase** backend integration.

**Current State:** Starter template with Supabase configured

**Tech Stack:**
- Frontend: React 18.3, TypeScript
- Styling: Tailwind CSS
- Build Tool: Vite
- Backend: Supabase
- UI Icons: Lucide React

---

## Part 1: Running the Application Locally

### Prerequisites

Make sure you have these installed:
- **Node.js** (version 18 or higher) - Check with: `node --version`
- **npm** (comes with Node.js) - Check with: `npm --version`

### Step 1: Navigate to Project Directory

```bash
cd /srv/proj/outskill_hackathon/project
```

### Step 2: Install Dependencies

```bash
npm install
```

This will:
- Download all required packages from package.json
- Create a node_modules folder
- Generate package-lock.json (if not exists)
- Take 1-2 minutes to complete

### Step 3: Verify Environment Variables

The project already has a `.env` file with Supabase credentials:

```
VITE_SUPABASE_URL=https://frbqmoyachddxwwdabjb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**✅ These are already configured - no changes needed!**

### Step 4: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: Open in Browser

1. Open your browser
2. Go to: `http://localhost:5173/`
3. You should see: **"Start prompting (or editing) to see magic happen :)"**

**✅ Application is now running!**

---

## Part 2: Available npm Commands

```bash
# Start development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint

# Type-check TypeScript without building
npm run typecheck
```

---

## Part 3: Project Structure

```
project/
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles (Tailwind)
│   └── vite-env.d.ts        # TypeScript environment types
├── .env                     # Environment variables (Supabase credentials)
├── index.html               # HTML template
├── package.json             # Project dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── eslint.config.js         # ESLint configuration
```

---

## Part 4: Add to Git Repository and Push to GitHub

### Step 4.1: Add Project to Local Git Repository

```bash
# Navigate to the root repository
cd /srv/proj

# Add the entire outskill_hackathon folder
git add outskill_hackathon/

# Check what will be committed
git status

# Commit the changes
git commit -m "Add FitAdapt fitness tracker project from Outskill Hackathon"
```

### Step 4.2: Create GitHub Repository

**Option A: Using GitHub Website (Easier)**

1. Go to: `https://github.com`
2. Click **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name:** `fitness-projects` or `outskill-hackathon`
   - **Description:** "Fitness tracker projects and documentation"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**
5. **Copy** the repository URL (looks like: `https://github.com/yourusername/fitness-projects.git`)

**Option B: Using GitHub CLI (if installed)**

```bash
# Create repository directly from command line
gh repo create fitness-projects --public --source=. --remote=origin --push
```

### Step 4.3: Connect Local Repository to GitHub

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify remote was added
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git (fetch)
# origin  https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git (push)
```

### Step 4.4: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin master

# You may be prompted for GitHub credentials
# Username: your_github_username
# Password: use a Personal Access Token (not your password)
```

**If you need a Personal Access Token:**
1. Go to: `https://github.com/settings/tokens`
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Select scopes: `repo` (full control of private repositories)
4. Click **"Generate token"**
5. **Copy** the token and use it as your password

### Step 4.5: Verify Upload

1. Go to your GitHub repository in browser
2. You should see the `outskill_hackathon/` folder
3. Navigate to: `outskill_hackathon/project/` to see the code

**✅ Project is now on GitHub!**

---

## Part 5: Deploy to Production (Optional)

### Option 1: Deploy to Netlify

1. **Build the project:**
   ```bash
   cd /srv/proj/outskill_hackathon/project
   npm run build
   ```
   This creates a `dist/` folder

2. **Go to:** `https://www.netlify.com`
3. **Sign up/Login** with GitHub
4. **Drag and drop** the `dist/` folder onto Netlify
5. **Add environment variables:**
   - Site Settings → Environment Variables
   - Add: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. **Redeploy** the site

### Option 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd /srv/proj/outskill_hackathon/project
   vercel
   ```

3. **Follow prompts:**
   - Link to existing project or create new
   - Add environment variables when prompted

### Option 3: Deploy to GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   Add to scripts:
   ```json
   "deploy": "vite build && gh-pages -d dist"
   ```

3. **Update vite.config.ts:**
   Add base URL:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [react()],
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## Part 6: Next Steps for Development

This is currently a **starter template**. To build the full FitAdapt fitness tracker:

### Follow the MVP Guide

Refer to `/srv/proj/outskill_hackathon/fitness_tracker_MVP_guide.md` which includes:

1. **Supabase Database Setup**
   - Create tables (profiles, goals, workouts)
   - Set up Row Level Security
   - Create database functions

2. **Build Frontend Pages**
   - Dashboard
   - Goals
   - Workouts
   - Profile

3. **Add Authentication**
   - Login/Signup
   - Protected routes

4. **Connect to Supabase**
   - Already have credentials in .env
   - Just need to implement the features

### Or Use Bolt.new to Generate Features

1. Go to: `https://bolt.new`
2. Use prompts from the fitness tracker guides
3. Download generated code
4. Replace contents of `src/` folder

---

## Part 7: Troubleshooting

### Problem: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json and try again
rm package-lock.json
npm install
```

### Problem: Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Problem: Supabase connection errors

**Solution:**
1. Check `.env` file exists and has correct values
2. Verify Supabase project is active at: `https://supabase.com/dashboard`
3. Check network connection

### Problem: Git push authentication fails

**Solution:**
1. Use a Personal Access Token instead of password
2. Or configure SSH keys: `https://docs.github.com/en/authentication/connecting-to-github-with-ssh`

---

## Part 8: Project Files Included

In the `outskill_hackathon/` folder you have:

```
outskill_hackathon/
├── project/                                    # Main React application
│   ├── src/                                   # Source code
│   ├── package.json                           # Dependencies
│   └── .env                                   # Supabase credentials
├── fitness_tracker_MVP_guide.md               # MVP build instructions
├── fitness_tracker_addons_guide.md            # Advanced features guide
├── fitness_tracker_clickable_guide.md         # Web UI only guide
├── build_instructions_fitness_tracker.md      # Original build guide
├── API_keys_for_Supabase_fitness_tracker.md  # API keys reference
└── HOW_TO_RUN_AND_DEPLOY.md                   # This file
```

---

## Summary - Quick Start Commands

```bash
# 1. Navigate to project
cd /srv/proj/outskill_hackathon/project

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173/

# 5. Add to git
cd /srv/proj
git add outskill_hackathon/
git commit -m "Add FitAdapt project"

# 6. Push to GitHub (after creating remote repo)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin master
```

---

## Support & Resources

- **Vite Documentation:** https://vitejs.dev/
- **React Documentation:** https://react.dev/
- **Supabase Documentation:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **GitHub Help:** https://docs.github.com/

---

**Ready to build your fitness tracker! 🚀**

Follow the guides in this folder to add features and deploy your app.
