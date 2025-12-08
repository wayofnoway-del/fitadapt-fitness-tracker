# Fitness Tracker MVP - Click-by-Click Build Guide
## Minimum Viable Product: Goals, Workouts & Dashboard

This guide will help you build the **core fitness tracker** with essential features only. You can add advanced features later using the add-ons guide.

---

## MVP Features Included:
✅ User authentication (signup/login)
✅ User profile setup
✅ Goal creation and tracking
✅ Workout logging
✅ Dashboard with stats and progress
✅ Workout history

## NOT Included in MVP (see add-ons guide):
❌ AI-generated challenges
❌ Local gym finder
❌ Advanced analytics

---

# Phase 1: Supabase Backend Setup (15 minutes)

## Step 1.1: Create Supabase Account

1. **Open your browser** and go to: `https://supabase.com`
2. **Click** the green **"Start your project"** button in the top right
3. **Choose sign-up method:**
   - Click **"Continue with GitHub"** (recommended), OR
   - Click **"Continue with Google"**, OR
   - Enter email/password and click **"Sign Up"**
4. **Verify your email** if prompted (check your inbox)

## Step 1.2: Create New Project

1. Once logged in, you'll see the **Dashboard**
2. **Click** the **"New Project"** button (green button on the right)
3. **Fill in the form:**
   - **Name:** `fitness-tracker-mvp`
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to your users (e.g., "US East")
   - **Pricing Plan:** Select **"Free"**
4. **Click** the green **"Create new project"** button
5. **Wait 2-3 minutes** while Supabase sets up your database

## Step 1.3: Save Your Project Credentials

1. Once ready, **click** on **"Settings"** (gear icon at bottom of left sidebar)
2. **Click** on **"API"** in the Settings menu
3. **Find and copy** these two items:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string)
4. **Save them** in a text file:
   ```
   SUPABASE_URL: https://xxxxx.supabase.co
   SUPABASE_ANON_KEY: eyJhbGc....(long string)
   ```

## Step 1.4: Create Database Tables (MVP Only)

1. **Click** **"SQL Editor"** in the left sidebar
2. **Click** **"+ New Query"** button (top right)
3. **Copy and paste** this code:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  age INTEGER,
  weight DECIMAL,
  height DECIMAL,
  preferred_activities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT, -- 'distance', 'weight', 'frequency', 'duration'
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT, -- 'km', 'kg', 'minutes', 'sessions'
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  workout_type TEXT NOT NULL, -- 'running', 'cycling', 'gym', 'swimming', 'yoga', 'other'
  duration INTEGER, -- minutes
  distance DECIMAL, -- km
  calories INTEGER,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'intense')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);
```

4. **Click** the **"Run"** button (or press F5)
5. **Check** the bottom panel - should see **"Success. No rows returned"**

## Step 1.5: Set Up Row Level Security

1. **Click** **"+ New Query"** again
2. **Copy and paste** this security code:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);
```

3. **Click** **"Run"**

## Step 1.6: Create Helper Functions

1. **Click** **"+ New Query"** again
2. **Copy and paste** this code:

```sql
-- Function to get user's fitness summary
CREATE OR REPLACE FUNCTION get_user_fitness_summary(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_workouts', COUNT(*),
    'total_distance', COALESCE(SUM(distance), 0),
    'total_duration', COALESCE(SUM(duration), 0),
    'total_calories', COALESCE(SUM(calories), 0),
    'recent_streak', (
      SELECT COUNT(DISTINCT workout_date)
      FROM workouts
      WHERE user_id = user_uuid
      AND workout_date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'active_goals', (
      SELECT COUNT(*)
      FROM goals
      WHERE user_id = user_uuid
      AND status = 'active'
    )
  ) INTO result
  FROM workouts
  WHERE user_id = user_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress(goal_uuid UUID, new_value DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE goals
  SET
    current_value = new_value,
    status = CASE
      WHEN new_value >= target_value THEN 'completed'
      ELSE status
    END
  WHERE id = goal_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Click** **"Run"**

## Step 1.7: Verify Database Setup

1. **Click** **"Table Editor"** in left sidebar
2. **Verify** you see these 3 tables:
   - `profiles`
   - `goals`
   - `workouts`

**✅ Supabase Backend Complete!**

---

# Phase 2: Build Frontend with Bolt (20 minutes)

## Step 2.1: Access Bolt.new

1. **Open a new browser tab**
2. Go to: `https://bolt.new`

## Step 2.2: Create Your MVP App

1. **Copy and paste** this exact prompt into the Bolt chat box:

```
Create a fitness tracker MVP app called "FitAdapt" with these features:

AUTHENTICATION:
- Login page with email/password
- Signup page with email/password
- Logout button in navigation
- Protected routes (redirect to login if not authenticated)

NAVIGATION:
- Top navigation bar with logo "FitAdapt" and links: Dashboard, Goals, Workouts, Profile, Logout
- Highlight active page
- Responsive mobile menu (hamburger)

DASHBOARD PAGE:
Display at top:
- 6 stat cards in a grid:
  1. Total Workouts (number)
  2. Total Distance (km)
  3. Total Duration (minutes)
  4. Total Calories (number)
  5. Active Goals (number)
  6. Current Streak (days in last 7 days)

Below stats:
- "Active Goals" section showing all active goals as cards with:
  - Goal title and description
  - Progress bar showing current_value / target_value
  - Percentage complete
  - Deadline date
  - "Update Progress" button

- "Recent Workouts" section showing last 5 workouts in a table:
  - Columns: Date, Type, Duration (min), Distance (km), Intensity
  - Sort by date descending

GOALS PAGE:
Top section:
- "Create New Goal" form with fields:
  - Title (text input)
  - Description (textarea)
  - Goal Type (dropdown: Distance, Weight Loss, Frequency, Duration)
  - Target Value (number)
  - Unit (text input: km, kg, sessions, minutes)
  - Deadline (date picker)
  - Submit button

Bottom section:
- Show all goals (active, completed, archived) in tabs
- Each goal card shows:
  - Title, description, progress bar
  - Current value / Target value
  - Edit button (opens modal to update current value)
  - Delete button (with confirmation)
  - Archive button (for active goals)
  - "Mark Complete" button (if target reached)

WORKOUTS PAGE:
Top section:
- "Log Workout" form with fields:
  - Date (date picker, default today)
  - Workout Type (dropdown: Running, Cycling, Gym, Swimming, Yoga, Other)
  - Duration (number in minutes)
  - Distance (number in km, optional)
  - Calories (number, optional)
  - Intensity (dropdown: Light, Moderate, Intense)
  - Notes (textarea, optional)
  - Submit button

Bottom section:
- Workout history table showing all workouts:
  - Columns: Date, Type, Duration, Distance, Calories, Intensity, Notes, Actions
  - Sort by date descending
  - Filter by date range (this week, this month, all time)
  - Filter by workout type (dropdown)
  - Edit button (opens modal to edit workout)
  - Delete button (with confirmation)

PROFILE PAGE:
- Form to edit user profile with fields:
  - Full Name (text)
  - Email (text, read-only)
  - Fitness Level (dropdown: Beginner, Intermediate, Advanced)
  - Age (number)
  - Weight (number in kg)
  - Height (number in cm)
  - Preferred Activities (multi-select: Running, Cycling, Swimming, Gym, Yoga, Other)
  - Save button

DESIGN & TECH STACK:
- Use React with TypeScript
- Use Tailwind CSS for all styling
- Primary color: Blue (#3B82F6)
- Modern, clean design with rounded corners and shadows
- Responsive design (mobile-friendly)
- Use recharts library for any charts
- Include loading states (spinners) for all data fetching
- Show error messages in red alert boxes
- Success messages in green alert boxes
- Use React Router for navigation
- Use React hooks (useState, useEffect, useContext)

FORMS:
- All forms should validate input before submission
- Show validation errors below each field
- Disable submit button while submitting
- Clear form after successful submission
- Show success message after submission

DATA STRUCTURE:
- Create TypeScript interfaces for Profile, Goal, Workout
- Use proper date formatting (YYYY-MM-DD for dates)
- Handle null/undefined values gracefully
```

2. **Click** Send (or press Enter)
3. **Wait 1-2 minutes** while Bolt generates your app
4. **Watch the right panel** - you'll see your app appear!

## Step 2.3: Add Supabase Integration

1. Once Bolt finishes, **type this** in the chat:

```
Now integrate Supabase as the backend:

1. Install @supabase/supabase-js package

2. Create src/lib/supabase.ts with:
   - Import createClient from @supabase/supabase-js
   - Create client using environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Export the client
   - Export TypeScript types for Profile, Goal, Workout matching the database schema

3. Create src/contexts/AuthContext.tsx:
   - Provide authentication state (user, loading)
   - Provide login, signup, logout functions using Supabase Auth
   - Listen for auth state changes
   - Store user in state

4. Update App.tsx:
   - Wrap app with AuthContext provider
   - Add protected route logic (redirect to /login if not authenticated)

5. Update all pages to use Supabase:

   DASHBOARD:
   - Fetch user's stats using get_user_fitness_summary function
   - Fetch active goals from 'goals' table where status='active'
   - Fetch recent 5 workouts from 'workouts' table ordered by date DESC
   - Show loading spinner while fetching
   - Show error message if fetch fails
   - Add "Update Progress" functionality that opens modal to input new current_value and calls update_goal_progress function

   GOALS:
   - Fetch all goals from 'goals' table
   - Insert new goals into 'goals' table
   - Update goal current_value and status
   - Delete goals from 'goals' table
   - Show loading and error states

   WORKOUTS:
   - Fetch all workouts from 'workouts' table
   - Insert new workouts into 'workouts' table
   - Update workouts
   - Delete workouts
   - Show loading and error states
   - Implement filters (by date range, by type) using Supabase queries

   PROFILE:
   - Fetch profile from 'profiles' table
   - Insert profile on first login (check if exists, if not create)
   - Update profile in 'profiles' table
   - Show loading and error states

   AUTH PAGES:
   - Use Supabase auth.signUp for signup
   - Use Supabase auth.signInWithPassword for login
   - Use Supabase auth.signOut for logout
   - Handle errors (show error messages)
   - Redirect to dashboard on successful login

6. Add proper error handling for all database operations

7. Add .env file with:
   VITE_SUPABASE_URL=https://pqggbansjhcubmwolfin.supabase.co

   VITE_SUPABASE_ANON_KEY=sb_publishable_kh0SCpaoV91iyGbGnlbuKw_-A8_s5fg

```

2. **Press Enter** and wait for Bolt to update
3. **Bolt will add** all Supabase integration code

## Step 2.4: Review and Test in Bolt

1. **Look at the preview** on the right side
2. **Click around** to test:
   - Try to access Dashboard (should redirect to Login)
   - Look at the Login/Signup forms
   - Check Goals page layout
   - Check Workouts page layout
   - Check Profile page layout

3. **If you want changes**, just tell Bolt:
   - "Make the stat cards bigger"
   - "Change the primary color to green"
   - "Add a chart showing workouts per week on the dashboard"

## Step 2.5: Add Environment Variables

1. In Bolt, **look at the file tree** on the left
2. **Find** the `.env` file
3. **If it doesn't exist**, tell Bolt:
   ```
   Create a .env file with:
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

**✅ Frontend MVP Complete!**

---

# Phase 3: Deployment (10 minutes)

## Step 3.1: Download Your Code

1. In Bolt, **click** the **"Download"** button (top right)
2. **Choose** "Download as ZIP"
3. **Save** the file to your computer
4. **Unzip** the file to a folder (e.g., `fitness-tracker-mvp`)

## Step 3.2: Deploy to Netlify

### 3.2.1: Create Netlify Account

1. **Go to:** `https://www.netlify.com`
2. **Click** **"Sign up"**
3. **Choose** **"Sign up with GitHub"** (easiest)
4. **Authorize** Netlify

### 3.2.2: Deploy Your App

1. In Netlify dashboard, **scroll down** to "Want to deploy a new site without connecting to Git?"
2. **Click** **"Deploy manually"**
3. You'll see a **drag-and-drop zone**
4. **Find** the `dist` folder in your unzipped Bolt code
   - **If no `dist` folder exists**, go back to Bolt and ask:
     ```
     Build the production version of the app. Make sure there's a dist folder.
     ```
   - Then download again
5. **Drag the `dist` folder** onto the Netlify drop zone
6. **Wait** 1-2 minutes for deployment
7. **Your site is live!** You'll get a URL like: `https://random-name-123.netlify.app`

### 3.2.3: Add Environment Variables

1. **Click** **"Site settings"**
2. **Click** **"Environment variables"** (left menu)
3. **Click** **"Add a variable"** → **"Add a single variable"**
4. **Add these variables:**
   - Key: `VITE_SUPABASE_URL`
   - Value: (paste your Supabase URL from earlier)
   - **Click** "Create variable"

5. **Click** **"Add a variable"** again
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: (paste your Supabase anon key from earlier)
   - **Click** "Create variable"

### 3.2.4: Redeploy with Environment Variables

1. **Click** **"Deploys"** (top menu)
2. **Click** **"Trigger deploy"** → **"Deploy site"**
3. **Wait** 1-2 minutes for new deployment

### 3.2.5: Change Site Name (Optional)

1. **Click** **"Site settings"**
2. **Click** **"Change site name"**
3. **Enter:** `fitadapt-mvp` (or your preferred name)
4. **Click** **"Save"**
5. **New URL:** `https://fitadapt-mvp.netlify.app`

## Step 3.3: Configure Supabase for Your Site

1. **Go back** to Supabase dashboard
2. **Click** **"Authentication"** (left sidebar)
3. **Click** **"URL Configuration"**
4. **Add your Netlify URL:**
   - Site URL: `https://fitadapt-mvp.netlify.app`
   - Redirect URLs: `https://fitadapt-mvp.netlify.app/**`
5. **Click** **"Save"**

**✅ Your MVP is Live!**

---

# Phase 4: Testing Your MVP (10 minutes)

## Step 4.1: Create Your Account

1. **Open** your live app: `https://fitadapt-mvp.netlify.app`
2. **Click** **"Sign Up"**
3. **Enter:**
   - Email: your-email@gmail.com
   - Password: (strong password with 8+ characters)
4. **Click** **"Sign Up"**
5. **Check your email** for Supabase confirmation link
6. **Click** the confirmation link in email
7. **You're logged in!**

## Step 4.2: Set Up Your Profile

1. **Click** **"Profile"** in navigation
2. **Fill in:**
   - Full Name: "Your Name"
   - Fitness Level: Choose one
   - Age: Your age
   - Weight: In kg
   - Height: In cm
   - Preferred Activities: Select at least one
3. **Click** **"Save"**
4. **Should see success message**

## Step 4.3: Create Your First Goal

1. **Click** **"Goals"** in navigation
2. **Fill in the form:**
   - Title: "Run 5km"
   - Description: "Be able to run 5km without stopping"
   - Goal Type: "Distance"
   - Target Value: 5
   - Unit: "km"
   - Deadline: (pick a date 1 month from now)
3. **Click** **"Create Goal"** (or submit button)
4. **You should see your goal** appear below with a progress bar at 0%

## Step 4.4: Log Your First Workout

1. **Click** **"Workouts"** in navigation
2. **Fill in the form:**
   - Date: Today
   - Workout Type: "Running"
   - Duration: 30 (minutes)
   - Distance: 3 (km)
   - Calories: 250 (optional)
   - Intensity: "Moderate"
   - Notes: "First run of my fitness journey!" (optional)
3. **Click** **"Log Workout"** (or submit button)
4. **You should see your workout** appear in the table below

## Step 4.5: Update Goal Progress

1. **Click** **"Dashboard"** in navigation
2. **You should see:**
   - Total Workouts: 1
   - Total Distance: 3 km
   - Total Duration: 30 min
   - Total Calories: 250
   - Active Goals: 1
   - Current Streak: 1 day
3. **In the Active Goals section**, find your "Run 5km" goal
4. **Click** **"Update Progress"** button
5. **Enter:** 3 (since you ran 3km today)
6. **Click** **"Update"** or **"Save"**
7. **Progress bar should update** to 60% (3/5)

## Step 4.6: Add More Sample Data

**Log a few more workouts:**
1. Go to Workouts page
2. Log a Gym workout: 45 min, Intense
3. Log a Cycling workout: 60 min, 15 km, Moderate
4. Log a Yoga workout: 30 min, Light

**Create another goal:**
1. Go to Goals page
2. Create "Workout 4x per week" goal
   - Type: Frequency
   - Target: 4
   - Unit: sessions per week

## Step 4.7: Verify Dashboard Updates

1. **Click** **"Dashboard"**
2. **Check stats** updated:
   - Total Workouts: 4
   - Total Distance: 18 km (3+15)
   - Active Goals: 2
3. **Check** Recent Workouts shows last 5 workouts
4. **Check** both goals appear with progress bars

**✅ MVP Testing Complete!**

---

# Troubleshooting Common Issues

## Problem: "Network error" or "Failed to fetch"

**Solution:**
1. **Check** environment variables in Netlify are correct
2. Go to Netlify → Site Settings → Environment Variables
3. **Verify** both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
4. **Redeploy** the site (Deploys → Trigger deploy)

## Problem: Can't see data in dashboard

**Solution:**
1. **Open browser console** (press F12)
2. **Look for errors** in the Console tab
3. **Common fixes:**
   - Make sure you created your profile first
   - Check that RLS policies were created correctly in Supabase
   - Verify you're logged in (check Authentication in Supabase dashboard)

## Problem: "Email not confirmed" error

**Solution:**
1. **Check spam folder** for confirmation email
2. **Or manually confirm:**
   - Go to Supabase → Authentication → Users
   - Find your user
   - Click "..." menu → "Confirm Email"

## Problem: Goals or workouts won't save

**Solution:**
1. **Check** Supabase Table Editor to see if data is there
2. **Check** browser console for errors
3. **Verify** all required fields are filled in forms
4. **Make sure** user is authenticated (refresh the page)

## Problem: Blank page after login

**Solution:**
1. **Check** the profile was created
   - Go to Supabase → Table Editor → profiles
   - You should see a row with your user ID
2. **If no profile exists:**
   - Go to Profile page and fill in the form
   - Or manually insert in Supabase Table Editor

## Problem: Stats showing 0 despite having workouts

**Solution:**
1. **Check** the `get_user_fitness_summary` function was created
   - Supabase → Database → Functions
   - Should see `get_user_fitness_summary`
2. **Test the function** in SQL Editor:
   ```sql
   SELECT get_user_fitness_summary('your-user-id');
   ```
3. **If function doesn't exist**, re-run the function creation SQL from Step 1.6

---

# What You've Built (MVP)

**✅ Complete fitness tracking system with:**
- User authentication and profiles
- Goal creation and tracking with progress bars
- Workout logging with history
- Dashboard with real-time stats
- Responsive design (works on mobile)
- Secure data storage with Row Level Security

**📊 User Flow:**
1. Sign up → Verify email → Login
2. Create profile with fitness info
3. Set fitness goals (run 5km, lose weight, etc.)
4. Log workouts after each session
5. Update goal progress
6. View stats and history on dashboard

**💰 Cost:** $0/month
- Supabase Free tier: Up to 50,000 monthly active users
- Netlify Free tier: 100GB bandwidth

---

# Next Steps

Now that your MVP is working, you can:

1. **Use it!** Start tracking your fitness journey
2. **Share with friends** and get feedback
3. **Add features** from the add-ons guide:
   - AI-generated challenges
   - Local gym finder
   - Advanced analytics
   - Social features

4. **Customize:**
   - Change colors and branding
   - Add more workout types
   - Add more goal types (body measurements, etc.)
   - Add charts and graphs

5. **Monitor usage:**
   - Check Supabase dashboard for user count
   - Check Netlify for bandwidth usage

---

# Ready for Add-ons?

See **`fitness_tracker_addons_guide.md`** to add:
- 🤖 AI-generated personalized challenges
- 🏋️ Local gym and fitness group finder
- 📊 Advanced analytics and charts
- 🔔 Notifications and reminders
- 👥 Social features (friends, sharing)

---

# Congratulations! 🎉

You've built a fully functional fitness tracking MVP using only web interfaces!

**Time invested:** ~1 hour
**Result:** Production-ready fitness tracker app
**Cost:** $0

Start tracking your fitness goals today! 💪
