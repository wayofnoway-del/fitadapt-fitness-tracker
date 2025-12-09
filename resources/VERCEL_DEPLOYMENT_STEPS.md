# FitAdapt - Vercel Deployment Steps

## ✅ Step 1: Vercel CLI Installed
The Vercel CLI has been installed in your project.

---

## 🚀 Step 2: Login to Vercel

Run this command in your terminal:

```bash
cd /srv/proj/outskill_hackathon/project
npx vercel login
```

**What happens:**
- A browser window will open
- Choose login method: GitHub, GitLab, Bitbucket, or Email
- **RECOMMENDED:** Use GitHub (since your code is already there)
- Authorize Vercel

---

## 📦 Step 3: Deploy Your App

After logging in, run:

```bash
npx vercel
```

**Answer the prompts:**

1. **Set up and deploy "~/project"?** → Press **Y**
2. **Which scope?** → Select your account (use arrow keys, press Enter)
3. **Link to existing project?** → Press **N**
4. **What's your project's name?** → Type: **fitadapt-demo** (or press Enter for default)
5. **In which directory is your code located?** → Press Enter (uses current directory)
6. **Want to override settings?** → Press **N**

**Vercel will now:**
- Build your app
- Deploy to a preview URL
- Give you a link like: `https://fitadapt-demo-abc123.vercel.app`

---

## 🔐 Step 4: Add Environment Variables

You need to add your Supabase credentials:

```bash
npx vercel env add VITE_SUPABASE_URL production
```

**When prompted, paste:**
```
https://pqggbansjhcubmwolfin.supabase.co
```

Then:
```bash
npx vercel env add VITE_SUPABASE_ANON_KEY production
```

**When prompted, paste:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZ2diYW5zamhjdWJtd29sZmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDY4MTYsImV4cCI6MjA4MDcyMjgxNn0.VQJBH7f1k0rknTFVNbaWJwmux6qSOmuPYcfp0WxOoA8
```

---

## 🎯 Step 5: Deploy to Production

Now deploy with the environment variables:

```bash
npx vercel --prod
```

**This will:**
- Build your app with production environment variables
- Deploy to your production URL
- Give you: `https://fitadapt-demo.vercel.app`

---

## ✅ Step 6: Test Your Demo

1. Visit your production URL
2. Test the complete flow:
   - Sign up
   - Create profile
   - Set goal
   - Log workout
   - Generate AI challenge
   - Search locations
   - Create group challenge
   - View dashboard

---

## 🎨 Optional: Custom Domain

If you have a custom domain:

1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to "Settings" → "Domains"
4. Add your domain
5. Update DNS records as shown

---

## 🔄 Future Updates

After initial deployment, updating is easy:

```bash
# Just commit to GitHub
git add .
git commit -m "Update features"
git push

# Vercel auto-deploys!
# OR manually deploy:
npx vercel --prod
```

---

## 📊 What You Get

**Production URL:** `https://fitadapt-demo.vercel.app`

**Features:**
- ✅ Auto HTTPS
- ✅ Global CDN (fast worldwide)
- ✅ Auto-deploy on git push
- ✅ Free analytics
- ✅ 100GB bandwidth/month
- ✅ Custom domain support

---

## 🐛 Troubleshooting

**Build fails:**
```bash
# Test build locally first
npm run build

# If local build works, check Vercel logs
npx vercel logs
```

**Environment variables not working:**
```bash
# List all env vars
npx vercel env ls

# Remove and re-add if needed
npx vercel env rm VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_URL production
```

**App shows blank page:**
- Check browser console for errors
- Verify environment variables are set
- Check Vercel deployment logs

---

## 🎉 Ready to Deploy!

Run these commands in order:

```bash
cd /srv/proj/outskill_hackathon/project
npx vercel login
npx vercel
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_ANON_KEY production
npx vercel --prod
```

Your demo will be live in ~3 minutes! 🚀
