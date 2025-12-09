# Fix AI Challenge Generation - Make it Use User Data

## Problem
The "Generate AI Challenge" button keeps creating the same generic challenge because the Edge Function **isn't reading the user's profile, workouts, and goals** from the database.

## Solution
The Edge Function needs to fetch user data and send it to OpenAI for personalized challenges.

## Step-by-Step Fix

### Step 1: Update the Edge Function on Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Edge Functions → `generate-challenge`
3. **Replace the entire code** with the code from:
   `/srv/proj/outskill_hackathon/project/supabase-functions-reference/generate-challenge/index-FIXED.ts`

4. **Deploy** the updated function

### Step 2: Verify Environment Variables

Make sure these secrets are set in Supabase Edge Functions:

1. Go to: **Project Settings → Edge Functions → Secrets**
2. Verify these exist:
   - `OPENAI_API_KEY` → Your OpenAI API key
   - `SUPABASE_URL` → (usually auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` → (usually auto-set)

### Step 3: Test

1. **Log a few workouts** (different types, intensities)
2. **Create a goal** (e.g., "Run 50km this month")
3. **Update your profile** (fitness level, preferred activities)
4. **Generate AI Challenge** → Should now be personalized!

## What Changed

### Before (OLD - Generic)
```typescript
// OLD CODE - No user data fetching
const response = await fetch(
  `${supabaseUrl}/functions/v1/generate-challenge`,
  { method: 'POST', headers: {...} }
)
// Edge Function generated generic challenges every time
```

### After (NEW - Personalized)
```typescript
// NEW CODE - Fetches user data in Edge Function
const { data: profile } = await supabaseAdmin
  .from('profiles').select('*').eq('id', user.id).single()

const { data: recentWorkouts } = await supabaseAdmin
  .from('workouts').select('*').eq('user_id', user.id).limit(10)

const { data: currentGoals } = await supabaseAdmin
  .from('goals').select('*').eq('user_id', user.id)

// Then sends ALL this context to OpenAI
const userPrompt = `Create challenge for:
PROFILE: ${fitnessLevel}, ${preferredActivities}
RECENT WORKOUTS: ${workoutSummary}
CURRENT GOALS: ${goalsSummary}
`
```

## Key Improvements in Fixed Code

1. **Fetches User Profile**: fitness_level, preferred_activities, age, weight
2. **Fetches Last 10 Workouts**: workout types, duration, intensity patterns
3. **Fetches Active Goals**: titles, progress, targets
4. **Sends Rich Context to OpenAI**: Full user data in the prompt
5. **Higher Temperature (0.8)**: More creative, varied challenges
6. **Specific Instructions**: "Build on recent patterns", "Progressive overload"

## Expected Behavior After Fix

✅ **First Challenge**: "Based on your 3 recent runs averaging 5km, complete 4 runs totaling 25km in 7 days"

✅ **Second Challenge**: "Since you're working on strength, do 5 gym sessions with 30min+ each, focusing on progressive weight increases"

✅ **Third Challenge**: "Mix it up! Your yoga sessions show good flexibility - try 3 yoga + 2 cardio sessions, 200min total"

Each challenge will be **unique and personalized** based on YOUR actual data!

## Troubleshooting

**Still getting generic challenges?**
1. Check Supabase Edge Function logs for errors
2. Verify OpenAI API key is valid
3. Ensure you have data in: profiles, workouts, goals tables
4. Check browser console for any errors

**Challenge doesn't match your data?**
1. Log more diverse workouts (different types)
2. Add specific goals with measurable targets
3. Update profile with accurate fitness level
4. Try generating 2-3 challenges to see variety
