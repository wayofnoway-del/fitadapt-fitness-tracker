# Fitness Tracker Project Documentation

## Interaction 1: Name Suggestions

**User Request:**
Please suggest exciting and motivating names for a fitness tracker. The fitness tracker will propose challenges to each member based on current fitness level and stated goals. The tracker will also scrape the web for local fitness groups and local gyms. The tracker will account for the current state of fitness of each member based on historical fitness data accumulated by the user at each session and by an optional intake query at account initialization.

**Response:**

Here are some exciting fitness tracker name suggestions organized by theme:

### Challenge & Achievement Focused
- **RiseLevel** - Emphasizes leveling up and progression
- **QuestFit** - Gamifies fitness as a personal quest
- **AimHigh** - Motivational, goal-oriented
- **ChallengePulse** - Dynamic, active challenges
- **StriveNext** - Always moving to the next challenge
- **PeakForge** - Forging yourself toward peak performance

### Personalized & Adaptive
- **FitAdapt** - Highlights adaptive challenges
- **MyPaceTracker** - Personal progression at your speed
- **ShapeShift** - Adapting and transforming
- **FlexPath** - Flexible, personalized journey
- **DialedinFit** - Perfectly calibrated to you
- **TuneUp** - Fine-tuned to your fitness level

### Momentum & Energy
- **MomentumFit** - Building continuous progress
- **SurgeTracker** - Powerful forward movement
- **IgniteFit** - Sparking motivation
- **PropelFit** - Pushing you forward
- **ThrivePace** - Not just surviving, thriving
- **VelocityFit** - Speed and progress

### Community & Discovery
- **FitConnect** - Connecting to local groups/gyms
- **CrewFit** - Finding your fitness crew
- **LocalLift** - Discovering local fitness community
- **TribeFit** - Building your fitness tribe
- **RallyFit** - Rallying together

### Bold & Unique
- **AscendFit** - Always ascending to new levels
- **Katalyst** - Spark that catalyzes change (creative spelling)
- **Elevate** - Simple, powerful, upward
- **Unstuck** - Breaking through plateaus
- **RevUp** - Energizing, accelerating

**Top 3 Recommendations:**
1. **RiseLevel** - Perfectly captures progression and personalized challenges
2. **QuestFit** - Gamifies the experience, makes it feel like an adventure
3. **FitAdapt** - Clearly communicates the adaptive, personalized nature

---

## Interaction 2: Build Instructions

**User Request:**
Fitness Goal Tracker:
Description: An app (as described above) where users set fitness goals (e.g., run 5km) and log progress with a simple dashboard.
How to Build:
Use Bolt to build front end, Supabase for Backend and Openai API to integrate AI
Please set out detailed instructions on how to go about building this application.

**Response:**

# Fitness Goal Tracker - Complete Build Guide

## Phase 1: Planning & Architecture

### 1.1 Define Core Features
- User authentication & profiles
- Fitness goal setting
- Progress logging (workouts, metrics)
- AI-generated personalized challenges
- Local gym/group discovery
- Dashboard with analytics
- Historical data tracking

### 1.2 Data Model Design
```
Users
- id, email, name, created_at
- fitness_level (beginner/intermediate/advanced)
- preferences (workout types, frequency goals)

Goals
- id, user_id, title, target_value, current_value
- deadline, status, created_at

Workouts
- id, user_id, date, type, duration, distance
- calories, notes, intensity

Challenges
- id, user_id, title, description, difficulty
- start_date, end_date, completed, ai_generated

Local_Gyms
- id, name, address, latitude, longitude
- type, rating, website, last_scraped
```

---

## Phase 2: Supabase Backend Setup

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up and create new project
3. Save your project URL and anon key

### 2.2 Set Up Database Tables

**In Supabase SQL Editor, run:**

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
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT, -- 'km', 'kg', 'minutes', 'sessions'
  deadline DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  workout_type TEXT, -- 'running', 'cycling', 'gym', 'swimming'
  duration INTEGER, -- minutes
  distance DECIMAL, -- km
  calories INTEGER,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'intense')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Challenges table
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  start_date DATE,
  end_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT TRUE,
  challenge_data JSONB, -- store additional challenge parameters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Local Gyms table
CREATE TABLE local_gyms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  gym_type TEXT,
  rating DECIMAL,
  website TEXT,
  phone TEXT,
  last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_challenges_user ON challenges(user_id);
CREATE INDEX idx_gyms_location ON local_gyms(latitude, longitude);
```

### 2.3 Set Up Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

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

-- Challenges policies
CREATE POLICY "Users can view own challenges" ON challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- Local gyms are public
CREATE POLICY "Anyone can view gyms" ON local_gyms
  FOR SELECT TO authenticated USING (true);
```

### 2.4 Create Database Functions

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
    'avg_intensity', mode() WITHIN GROUP (ORDER BY intensity),
    'recent_streak', (
      SELECT COUNT(*) FROM (
        SELECT workout_date FROM workouts
        WHERE user_id = user_uuid
        AND workout_date >= CURRENT_DATE - INTERVAL '7 days'
      ) recent
    )
  ) INTO result
  FROM workouts
  WHERE user_id = user_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 3: Frontend Development with Bolt

### 3.1 Initialize Project in Bolt

1. Go to https://bolt.new
2. Enter this prompt:

```
Create a fitness goal tracker app with the following features:

1. User authentication (login/signup)
2. Dashboard showing:
   - Active goals with progress bars
   - Recent workouts list
   - Weekly activity chart
   - Current challenges

3. Goals page:
   - Create new goals (title, target, deadline)
   - View all goals
   - Update progress
   - Delete goals

4. Workouts page:
   - Log workout form (date, type, duration, distance, intensity)
   - Workout history table
   - Filter by date range

5. Challenges page:
   - Display AI-generated challenges
   - Mark challenges as complete
   - Request new challenges

6. Local Gyms page:
   - Search for gyms near user location
   - Display gym cards with details
   - Map view

Use React, TypeScript, Tailwind CSS, and Recharts for visualizations.
Include responsive design for mobile.
```

### 3.2 Connect Supabase to Bolt

**Add Supabase client configuration:**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type Profile = {
  id: string
  email: string
  full_name: string
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  age: number
  weight: number
  height: number
  preferred_activities: string[]
}

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string
  goal_type: string
  target_value: number
  current_value: number
  unit: string
  deadline: string
  status: string
}

export type Workout = {
  id: string
  user_id: string
  workout_date: string
  workout_type: string
  duration: number
  distance: number
  calories: number
  intensity: 'light' | 'moderate' | 'intense'
  notes: string
}

export type Challenge = {
  id: string
  user_id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  start_date: string
  end_date: string
  completed: boolean
}
```

**Create `.env` file:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_key
```

### 3.3 Implement Authentication

Create `src/components/Auth.tsx`:
```typescript
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email for confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isSignUp ? 'Sign Up' : 'Login'}
      </h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-blue-500 underline"
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  )
}
```

### 3.4 Build Core Components

**Dashboard Component** (`src/components/Dashboard.tsx`):
```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Goal, Workout } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch active goals
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(5)

    setGoals(goalsData || [])

    // Fetch recent workouts
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })
      .limit(5)

    setRecentWorkouts(workoutsData || [])

    // Fetch stats
    const { data: statsData } = await supabase
      .rpc('get_user_fitness_summary', { user_uuid: user.id })

    setStats(statsData)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Workouts</h3>
          <p className="text-2xl font-bold">{stats?.total_workouts || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Distance</h3>
          <p className="text-2xl font-bold">{stats?.total_distance || 0} km</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Duration</h3>
          <p className="text-2xl font-bold">{stats?.total_duration || 0} min</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Current Streak</h3>
          <p className="text-2xl font-bold">{stats?.recent_streak || 0} days</p>
        </div>
      </div>

      {/* Active Goals */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Active Goals</h2>
        {goals.map(goal => (
          <div key={goal.id} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{goal.title}</span>
              <span className="text-gray-600">
                {goal.current_value}/{goal.target_value} {goal.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Workouts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Workouts</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Duration</th>
              <th className="text-left p-2">Distance</th>
            </tr>
          </thead>
          <tbody>
            {recentWorkouts.map(workout => (
              <tr key={workout.id} className="border-b">
                <td className="p-2">{workout.workout_date}</td>
                <td className="p-2 capitalize">{workout.workout_type}</td>
                <td className="p-2">{workout.duration} min</td>
                <td className="p-2">{workout.distance} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## Phase 4: OpenAI Integration

### 4.1 Create API Route for AI Challenges

**Note:** Since Bolt runs client-side, you'll need a backend API endpoint. Options:
- Supabase Edge Functions
- Separate Node.js/Express server
- Vercel/Netlify serverless functions

**Supabase Edge Function approach** (`supabase/functions/generate-challenge/index.ts`):

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  try {
    const { userId, fitnessLevel, goals, recentWorkouts } = await req.json()

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a fitness coach creating personalized workout challenges.'
          },
          {
            role: 'user',
            content: `Create a fitness challenge for a ${fitnessLevel} level user.

Current goals: ${JSON.stringify(goals)}
Recent workouts: ${JSON.stringify(recentWorkouts)}

Generate a challenge in JSON format with:
- title: string
- description: string (detailed instructions)
- difficulty: easy/medium/hard
- duration_days: number
- target_metrics: object

Make it personalized, achievable, and progressive based on their current fitness level.`
          }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const challengeData = JSON.parse(data.choices[0].message.content)

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        user_id: userId,
        title: challengeData.title,
        description: challengeData.description,
        difficulty: challengeData.difficulty,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + challengeData.duration_days * 86400000).toISOString(),
        challenge_data: challengeData.target_metrics,
        ai_generated: true,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ challenge }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Deploy Edge Function:**
```bash
supabase functions deploy generate-challenge --no-verify-jwt
```

### 4.2 Frontend Integration

Create `src/services/ai.ts`:
```typescript
import { supabase } from '../lib/supabase'

export async function generateChallenge() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch user data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('workout_date', { ascending: false })
    .limit(10)

  // Call edge function
  const { data, error } = await supabase.functions.invoke('generate-challenge', {
    body: {
      userId: user.id,
      fitnessLevel: profile.fitness_level,
      goals,
      recentWorkouts,
    },
  })

  if (error) throw error
  return data.challenge
}
```

---

## Phase 5: Web Scraping for Local Gyms

### 5.1 Create Scraping Edge Function

**Option 1: Google Places API** (Recommended - more reliable)

`supabase/functions/search-gyms/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')

serve(async (req) => {
  try {
    const { latitude, longitude, radius = 5000 } = await req.json()

    // Search for gyms using Google Places API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=gym&key=${googleApiKey}`
    )

    const data = await response.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Process and save gyms
    const gyms = data.results.map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      gym_type: 'gym',
      rating: place.rating,
      last_scraped: new Date().toISOString(),
    }))

    // Upsert gyms (update if exists, insert if new)
    const { data: savedGyms, error } = await supabase
      .from('local_gyms')
      .upsert(gyms, { onConflict: 'name,address' })
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ gyms: savedGyms }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Option 2: Web Scraping** (Yelp, local directories)

```typescript
// Using Deno's DOM parser
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

async function scrapeYelpGyms(city: string) {
  const response = await fetch(`https://www.yelp.com/search?find_desc=gyms&find_loc=${city}`)
  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const gyms = []
  const listings = doc.querySelectorAll('.businessName')

  for (const listing of listings) {
    // Extract gym details from Yelp HTML structure
    // Note: This is fragile and may break if Yelp changes their HTML
  }

  return gyms
}
```

### 5.2 Frontend Gym Search Component

`src/components/GymFinder.tsx`:
```typescript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function GymFinder() {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)

  const searchNearbyGyms = async () => {
    setLoading(true)

    // Get user's location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      setLocation({ lat: latitude, lng: longitude })

      // Call edge function
      const { data, error } = await supabase.functions.invoke('search-gyms', {
        body: { latitude, longitude, radius: 5000 }
      })

      if (!error) {
        setGyms(data.gyms)
      }
      setLoading(false)
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Find Local Gyms</h1>

      <button
        onClick={searchNearbyGyms}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mb-6"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Find Gyms Near Me'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gyms.map((gym: any) => (
          <div key={gym.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">{gym.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{gym.address}</p>
            {gym.rating && (
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{gym.rating}</span>
              </div>
            )}
            {gym.website && (
              <a
                href={gym.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm"
              >
                Visit Website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Phase 6: Testing & Deployment

### 6.1 Local Testing
```bash
# Test Supabase functions locally
supabase functions serve

# Test in browser
npm run dev
```

### 6.2 Deploy Supabase Functions
```bash
supabase functions deploy generate-challenge
supabase functions deploy search-gyms
```

### 6.3 Deploy Frontend

**From Bolt:**
1. Click "Download" to get your code
2. Deploy to Vercel/Netlify:

```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Or deploy to Netlify
npm i -g netlify-cli
netlify deploy --prod
```

### 6.4 Environment Variables

Set in your deployment platform:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Set in Supabase dashboard (Settings > Edge Functions):
```
OPENAI_API_KEY=your_openai_key
GOOGLE_PLACES_API_KEY=your_google_key
```

---

## Phase 7: Advanced Features

### 7.1 Intake Questionnaire

Create onboarding flow for new users:

```typescript
const questions = [
  { id: 'fitness_level', text: 'What is your current fitness level?', options: ['beginner', 'intermediate', 'advanced'] },
  { id: 'goals', text: 'What are your fitness goals?', type: 'multi-select', options: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility'] },
  { id: 'activities', text: 'Preferred activities?', type: 'multi-select', options: ['running', 'cycling', 'swimming', 'gym', 'yoga'] },
  { id: 'frequency', text: 'How many days per week can you work out?', type: 'number' },
]
```

### 7.2 Progress Analytics

Add charts using Recharts:
- Weekly workout frequency
- Distance/duration trends
- Goal completion rate
- Workout type distribution

### 7.3 Notifications

Use Supabase Realtime for:
- Challenge reminders
- Goal milestones
- New gym suggestions

---

## Cost Estimates

**Supabase:** Free tier (50k monthly active users)
**OpenAI API:** ~$0.002 per challenge generated
**Google Places API:** Free tier (basic), $32/1000 requests
**Hosting:** Vercel/Netlify free tier

---

## Next Steps Checklist

1. ✅ Set up Supabase project and database
2. ✅ Create tables and RLS policies
3. ✅ Build frontend in Bolt
4. ✅ Implement authentication
5. ✅ Create dashboard and core pages
6. ✅ Deploy Supabase Edge Functions
7. ✅ Integrate OpenAI for challenges
8. ✅ Add gym search functionality
9. ✅ Test end-to-end
10. ✅ Deploy to production
