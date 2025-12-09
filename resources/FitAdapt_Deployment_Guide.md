# FitAdapt Deployment Guide
## How to Host Your Demo

---

## Option 1: Vercel (RECOMMENDED - Easiest & Free)
**Best for:** Quick demos, free hosting, automatic deployments

### Why Vercel?
- ✅ Free forever plan
- ✅ Automatic HTTPS
- ✅ Global CDN (fast worldwide)
- ✅ Auto-deploys on git push
- ✅ Custom domain support
- ✅ Perfect for React/Vite apps
- ⚡ Deploy in 2 minutes

### Step-by-Step Deployment:

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```
(Opens browser, sign in with GitHub/email)

#### 3. Deploy from your project folder
```bash
cd /srv/proj/outskill_hackathon/project
vercel
```

**During setup, answer:**
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- What's your project's name? **fitadapt-demo** (or leave default)
- In which directory is your code? **./** (current directory)
- Want to override settings? **N**

#### 4. Your app is live!
You'll get a URL like: `https://fitadapt-demo.vercel.app`

#### 5. Set environment variables
```bash
vercel env add VITE_SUPABASE_URL production
# Paste: https://pqggbansjhcubmwolfin.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your anon key
```

#### 6. Redeploy with environment variables
```bash
vercel --prod
```

**Your demo is now live!** 🎉

---

## Option 2: Netlify (Alternative Free Option)
**Best for:** Similar to Vercel, drag-and-drop deployment

### Step-by-Step:

#### 1. Build your project
```bash
cd /srv/proj/outskill_hackathon/project
npm run build
```

#### 2. Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 3. Login and deploy
```bash
netlify login
netlify deploy
```

#### 4. Deploy to production
```bash
netlify deploy --prod
```

#### 5. Add environment variables
- Go to Netlify dashboard
- Site settings → Environment variables
- Add:
  - `VITE_SUPABASE_URL` = `https://pqggbansjhcubmwolfin.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`

**Your URL:** `https://fitadapt-demo.netlify.app`

---

## Option 3: GitHub Pages (100% Free, No Sign-up Needed)
**Best for:** Public demos, simple hosting

### Step-by-Step:

#### 1. Install gh-pages package
```bash
cd /srv/proj/outskill_hackathon/project
npm install --save-dev gh-pages
```

#### 2. Update package.json
Add to `package.json`:
```json
{
  "homepage": "https://wayofnoway-del.github.io/fitadapt-fitness-tracker",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. Update vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fitadapt-fitness-tracker/', // Add this line
})
```

#### 4. Create .env.production
```bash
cat > .env.production << 'EOF'
VITE_SUPABASE_URL=https://pqggbansjhcubmwolfin.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZ2diYW5zamhjdWJtd29sZmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDY4MTYsImV4cCI6MjA4MDcyMjgxNn0.VQJBH7f1k0rknTFVNbaWJwmux6qSOmuPYcfp0WxOoA8
EOF
```

#### 5. Deploy
```bash
npm run deploy
```

**Your URL:** `https://wayofnoway-del.github.io/fitadapt-fitness-tracker`

**Enable GitHub Pages:**
- Go to repository settings
- Pages → Source: `gh-pages` branch
- Save

---

## Option 4: Railway (Free Tier with Database Hosting)
**Best for:** Full-stack apps, includes database hosting

### Quick Deploy:
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Railway auto-detects Vite and deploys

**Your URL:** `https://fitadapt-demo.up.railway.app`

---

## Option 5: Cloudflare Pages (Free, Fast CDN)
**Best for:** Global performance, DDoS protection

### Quick Deploy:
1. Go to https://pages.cloudflare.com
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables
5. Deploy

**Your URL:** `https://fitadapt-demo.pages.dev`

---

## RECOMMENDED SETUP FOR DEMO

### Best Combination:
**Vercel (Frontend) + Supabase (Backend - already done!)**

**Why this combo?**
- ✅ Both free forever
- ✅ Vercel = instant React deployments
- ✅ Supabase = backend already set up
- ✅ 2-minute total setup
- ✅ Auto-deploys on git push
- ✅ Professional URLs
- ✅ HTTPS included
- ✅ Fast globally

---

## STEP-BY-STEP: FASTEST DEMO DEPLOYMENT

### Prerequisites Check:
```bash
cd /srv/proj/outskill_hackathon/project
npm run build  # Make sure it builds successfully
```

### Deploy to Vercel (2 minutes):

#### Terminal commands:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd /srv/proj/outskill_hackathon/project
vercel

# 4. Add environment variables
vercel env add VITE_SUPABASE_URL production
# When prompted, paste: https://pqggbansjhcubmwolfin.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# When prompted, paste your anon key

# 5. Deploy to production
vercel --prod
```

#### You'll get:
- **Preview URL:** `https://fitadapt-demo-abc123.vercel.app`
- **Production URL:** `https://fitadapt-demo.vercel.app`

---

## POST-DEPLOYMENT CHECKLIST

### Test Your Demo:
- ✅ Visit the URL
- ✅ Sign up with a test account
- ✅ Complete profile
- ✅ Create a goal
- ✅ Log a workout
- ✅ Generate AI challenge (test OpenAI integration)
- ✅ Search for locations
- ✅ Create/join group challenge
- ✅ View dashboard

### Fix Common Issues:

#### Issue: Blank page
**Solution:** Check browser console for errors
```bash
# Rebuild and redeploy
npm run build
vercel --prod
```

#### Issue: Environment variables not working
**Solution:**
```bash
# List current env vars
vercel env ls

# Remove old ones
vercel env rm VITE_SUPABASE_URL production

# Add correctly
vercel env add VITE_SUPABASE_URL production
```

#### Issue: 404 on routes
**Solution:** Vercel should handle this automatically, but if not:
Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## CUSTOM DOMAIN (Optional)

### Add Custom Domain to Vercel:
1. Go to Vercel dashboard
2. Project → Settings → Domains
3. Add domain: `fitadapt.com` or `demo.fitadapt.com`
4. Update DNS records as shown
5. Wait 24-48 hours for propagation

**Free SSL certificate included!**

---

## SHARING YOUR DEMO

### For Pitch/Demo:

**Create a QR code:**
```bash
# Install qrencode
sudo apt-get install qrencode

# Generate QR code
qrencode -t PNG -o fitadapt-qr.png 'https://fitadapt-demo.vercel.app'
```

**Short links:**
- Use bit.ly or tinyurl.com
- Example: `bit.ly/fitadapt-demo`

### Demo Credentials:

Create a demo account and share:
```
Demo URL: https://fitadapt-demo.vercel.app
Demo Email: demo@fitadapt.com
Demo Password: Demo123!

Or: Sign up with your own email!
```

---

## MONITORING & ANALYTICS (Optional)

### Add Google Analytics:
1. Get tracking ID from analytics.google.com
2. Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Vercel Analytics (Built-in):
- Free with Vercel
- Automatic traffic tracking
- No setup needed

---

## COST COMPARISON

| Platform | Free Tier | Bandwidth | Custom Domain | Auto Deploy |
|----------|-----------|-----------|---------------|-------------|
| Vercel | ✅ Forever | 100GB/mo | ✅ Yes | ✅ Yes |
| Netlify | ✅ Forever | 100GB/mo | ✅ Yes | ✅ Yes |
| GitHub Pages | ✅ Forever | Soft 100GB/mo | ✅ Yes | ✅ Yes |
| Railway | 500hrs/mo | 100GB/mo | ✅ Yes | ✅ Yes |
| Cloudflare | ✅ Forever | Unlimited | ✅ Yes | ✅ Yes |

**All options are FREE for your demo needs!**

---

## AUTOMATED DEPLOYMENTS

### Set up GitHub Actions (Optional):

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Now every git push auto-deploys!

---

## RECOMMENDED NEXT STEPS

### After Deployment:

1. **Test thoroughly** - Go through all features
2. **Share the link** - Add to pitch deck
3. **Create demo account** - Pre-populate with sample data
4. **Update README** - Add live demo link
5. **Monitor usage** - Check Vercel analytics

### Update Your Pitch Deck:

Add to slide 16 (Contact):
```markdown
📱 Live Demo: https://fitadapt-demo.vercel.app
💻 GitHub: https://github.com/wayofnoway-del/fitadapt-fitness-tracker
```

---

## TROUBLESHOOTING

### Common Deployment Issues:

**Build fails:**
```bash
# Check build locally first
npm run build

# If successful locally but fails on Vercel:
# Check Node.js version in vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Environment variables not loading:**
```bash
# Verify they're set
vercel env ls

# Pull them locally to test
vercel env pull
```

**Supabase connection fails:**
- Check CORS settings in Supabase dashboard
- Verify anon key is correct
- Test Edge Functions from deployed URL

---

## SUMMARY

### Quick Start (Choose One):

**Option A: Fastest (Vercel)**
```bash
npm install -g vercel
vercel login
cd /srv/proj/outskill_hackathon/project
vercel
# Add env vars when prompted
vercel --prod
```
⏱️ Time: 2 minutes

**Option B: No CLI (Vercel Dashboard)**
1. Go to vercel.com
2. Import from GitHub
3. Add environment variables
4. Deploy
⏱️ Time: 3 minutes

**Option C: GitHub Pages (No Sign-up)**
```bash
npm install --save-dev gh-pages
# Update package.json and vite.config.ts (see above)
npm run deploy
```
⏱️ Time: 5 minutes

### What You Get:
- ✅ Live demo URL
- ✅ HTTPS security
- ✅ Global CDN (fast loading)
- ✅ Auto-deploys on git push
- ✅ Free forever
- ✅ Professional appearance

---

## NEED HELP?

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

**General Deployment:**
- Check browser console for errors
- Verify environment variables
- Test build locally first
- Check Vercel/Netlify deployment logs

---

Ready to deploy? Pick Vercel and you'll have a live demo in 2 minutes! 🚀
