# FitAdapt AI Agent Implementation Guide

## Current Setup Analysis

You currently have:
- **1 Edge Function:** `generate-challenge` (Personal AI Coach)
- **2 Frontend Pages:** `Challenges.tsx` (calls generate-challenge), `GroupChallenges.tsx` (manual creation only)

## What You Need to Change

---

## STEP 1: Create Second Edge Function for Group Challenge Coordinator

### 1.1 Create New Supabase Edge Function

In your Supabase Dashboard:

1. **Go to Edge Functions:** Dashboard → Edge Functions → New Function
2. **Name:** `generate-group-challenge`
3. **Code:** (see below)

**File:** `supabase/functions/generate-group-challenge/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Profile not found: ' + profileError.message)
    }

    // Get user's recent workouts for context
    const { data: recentWorkouts } = await supabaseAdmin
      .from('workouts')
      .select('workout_type, duration, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get user's current goals for context
    const { data: currentGoals } = await supabaseAdmin
      .from('goals')
      .select('title, category')
      .eq('user_id', user.id)
      .eq('completed', false)

    // Build context for AI
    const fitnessLevel = profile.fitness_level || 'intermediate'
    const recentActivity = recentWorkouts && recentWorkouts.length > 0
      ? recentWorkouts.map(w => w.workout_type).join(', ')
      : 'No recent activity'
    const goalsText = currentGoals && currentGoals.length > 0
      ? currentGoals.map(g => g.title).join(', ')
      : 'General fitness'

    // Call OpenAI API with Group Challenge Coordinator prompt
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build the prompt using string concatenation (Deno requirement)
    const systemPrompt = 'You are the FitAdapt Group Challenge Coordinator - a dynamic, community-building AI that transforms individual fitness journeys into powerful collective experiences through perfectly orchestrated group workout events. Your personality: Energetic, inclusive community builder, strategic coordinator, encouraging facilitator, adaptive and observant. You design group fitness challenges that bring people together, leverage collective motivation, and create memorable shared experiences where everyone - regardless of fitness level - feels challenged, included, and inspired.'

    const part1 = 'Create an exciting, inclusive group fitness challenge invitation for a '
    const part2 = ' level fitness enthusiast. Their recent activities: '
    const part3 = '. Their goals: '
    const part4 = '. Generate a compelling group challenge that would attract mixed fitness levels and build community. The challenge should have: 1) A catchy, motivating title, 2) An inclusive description that welcomes all fitness levels (250-400 words, upbeat tone, use emojis), 3) Suggested challenge type (running, cycling, hiking, yoga, circuit training), 4) Difficulty level (beginner-friendly, all-levels, intermediate, or advanced), 5) Suggested location type (park, trail, gym, outdoor space), 6) Duration in minutes (60-90), 7) Max participants (10-20), 8) What to bring, 9) Why join (community, accountability, fun). Return ONLY valid JSON with this structure: '

    const exampleJson = {
      title: "Saturday Sunrise 5K Social Run & Coffee",
      description: "🌅 Join us for an energizing start to the weekend! We'll run a scenic 5K loop through the park, then grab coffee together...",
      challenge_type: "running",
      difficulty: "all-levels",
      location_suggestion: "Riverside Park or similar scenic location",
      duration_minutes: 75,
      max_participants: 15,
      equipment_needed: "Water bottle, running shoes, positive vibes!",
      why_join: "Accountability, discover new routes, make fitness friends, start weekend feeling accomplished"
    }

    const part5 = '. Make it enthusiastic, welcoming, and community-focused!'

    const userPrompt = part1 + fitnessLevel + part2 + recentActivity + part3 + goalsText + part4 + JSON.stringify(exampleJson) + part5

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + openAiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // Higher creativity for engaging invitations
        max_tokens: 800,
      }),
    })

    const openAiData = await openAiResponse.json()

    if (!openAiResponse.ok) {
      throw new Error('OpenAI API error: ' + JSON.stringify(openAiData))
    }

    const aiContent = openAiData.choices[0].message.content

    // Parse JSON response
    let challengeData
    try {
      challengeData = JSON.parse(aiContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent)
      throw new Error('Invalid AI response format')
    }

    // Return the AI-generated group challenge template
    // Frontend will use this to pre-fill the create form
    return new Response(
      JSON.stringify({
        success: true,
        challengeTemplate: challengeData,
        message: 'Group challenge template generated! Review and customize before creating.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 1.2 Deploy the Edge Function

In Supabase Dashboard or using CLI:

```bash
# If you have Supabase CLI installed:
supabase functions deploy generate-group-challenge

# Or deploy via Supabase Dashboard:
# Edge Functions → generate-group-challenge → Deploy
```

### 1.3 Set Environment Variables

Make sure your Edge Function has the OpenAI API key:

In Supabase Dashboard:
- Settings → Edge Functions → Secrets
- Add: `OPENAI_API_KEY` = your OpenAI key

---

## STEP 2: Update Frontend to Use Both Agents

### 2.1 Update `GroupChallenges.tsx`

**Add AI generation button and functionality:**

**Changes to make in `/project/src/pages/GroupChallenges.tsx`:**

```typescript
// Add new state for AI generation
const [generatingAI, setGeneratingAI] = useState(false)

// Add new function to generate AI template
const generateAIChallenge = async () => {
  setGeneratingAI(true)
  setError('')
  setSuccess('')

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-group-challenge`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate challenge template')
    }

    // Pre-fill form with AI-generated template
    const template = result.challengeTemplate
    setTitle(template.title || '')
    setDescription(template.description || '')
    setChallengeType(template.challenge_type || 'running')
    setDifficulty(template.difficulty === 'beginner-friendly' ? 'easy' :
                  template.difficulty === 'all-levels' ? 'medium' :
                  template.difficulty === 'intermediate' ? 'medium' : 'hard')
    setMaxParticipants(template.max_participants || 10)

    // Open the modal with pre-filled data
    setShowCreateModal(true)
    setSuccess('AI template generated! Review and customize before creating.')
    setTimeout(() => setSuccess(''), 5000)
  } catch (err: any) {
    setError(err.message || 'Failed to generate AI template')
  } finally {
    setGeneratingAI(false)
  }
}
```

**Add button next to "Create Challenge" button:**

```typescript
// In the header section, replace the single button with two buttons:
<div className="flex gap-2">
  <button
    onClick={generateAIChallenge}
    disabled={generatingAI}
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
  >
    {generatingAI ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Generating...
      </>
    ) : (
      <>
        <Zap className="h-5 w-5" />
        AI Generate
      </>
    )}
  </button>
  <button
    onClick={() => setShowCreateModal(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  >
    <Plus className="h-5 w-5" />
    Create Manually
  </button>
</div>
```

**Don't forget to import Zap icon:**
```typescript
import { Users, Plus, Calendar, MapPin, Clock, Trophy, Check, X, Zap } from 'lucide-react'
```

---

## STEP 3: Update Personal Challenge Agent Prompt

### 3.1 Modify `generate-challenge` Edge Function

Your existing `generate-challenge` function should use the **Personal Challenge Generator** system prompt from the AI_Agent_System_Prompts.md file.

**Update the systemPrompt in your existing Edge Function:**

```typescript
const systemPrompt = 'You are the FitAdapt Personal Challenge Generator and Wellness Coach - an enthusiastic, motivating AI fitness companion dedicated to helping individuals achieve their complete wellness transformation. Your personality: Upbeat & energizing, empathetic & understanding, motivating without pressure, knowledgeable & holistic (exercise, nutrition, sleep, hydration, work-life balance), progressive & adaptive. You transform lives by creating personalized, achievable challenges that balance fitness, nutrition, recovery, and life harmony. You don\'t just generate workouts - you architect complete lifestyle transformations tailored to each person\'s unique journey.'
```

**Update the user prompt to include wellness data:**

```typescript
// Expand data collection to include sleep, hydration, etc. (if you add these fields to profiles table)
const part1 = 'Create a personalized wellness challenge for a '
const part2 = ' level user. Their current goals: '
const part3 = '. Their recent workouts: '
const part4 = '. Generate a holistic challenge that includes exercise, nutrition guidance, sleep optimization, hydration goals, and work-life balance tips. Make it enthusiastic, motivating, and actionable! Return ONLY valid JSON with this structure: '

const exampleJson = {
  title: "7-Day Energy & Strength Reset",
  description: "💪 Your mission: Reclaim your vitality with daily movement, better sleep, and smart nutrition...[full motivating description 300-500 words with emojis and specific daily breakdown]",
  difficulty: "medium",
  duration_days: 7,
  focus_areas: ["exercise", "nutrition", "sleep", "hydration", "recovery"],
  expected_outcomes: "More energy at work, better sleep quality, stronger core, healthier habits"
}

const part5 = '. Make it personal, achievable, and inspiring!'
```

---

## STEP 4: Enable Agent Communication (Future Enhancement)

To share insights between agents, you'll need:

### 4.1 Create Shared Insights Table

**SQL to run in Supabase:**

```sql
CREATE TABLE agent_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL, -- 'personal_coach' or 'group_coordinator'
  insight_type TEXT NOT NULL, -- 'performance', 'readiness', 'recommendation'
  insight_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE agent_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON agent_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert insights"
  ON agent_insights FOR INSERT
  WITH CHECK (true); -- Only Edge Functions with service role can insert
```

### 4.2 Store Insights After Each Challenge

**In `generate-challenge` Edge Function, after creating challenge:**

```typescript
// Store insight for group coordinator
await supabaseAdmin
  .from('agent_insights')
  .insert({
    user_id: user.id,
    agent_type: 'personal_coach',
    insight_type: 'readiness',
    insight_data: {
      fitness_level: fitnessLevel,
      recent_performance: 'improving', // analyze from workouts
      recovery_status: 'good', // analyze from sleep/workout frequency
      recommended_group_intensity: 'moderate',
      notes: 'User ready for group challenges, avoid high-intensity until Week 5'
    }
  })
```

**In `generate-group-challenge` Edge Function, read insights:**

```typescript
// Get insights from personal coach
const { data: personalInsights } = await supabaseAdmin
  .from('agent_insights')
  .select('*')
  .eq('user_id', user.id)
  .eq('agent_type', 'personal_coach')
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

// Use in prompt
const coachRecommendations = personalInsights?.insight_data?.recommended_group_intensity || 'moderate'
```

---

## STEP 5: Summary of Changes

### What Changes Where:

| Component | Current State | New State |
|-----------|---------------|-----------|
| **Edge Functions** | 1 function (`generate-challenge`) | 2 functions (`generate-challenge`, `generate-group-challenge`) |
| **Challenges.tsx** | Calls `generate-challenge` | Same (no changes needed) |
| **GroupChallenges.tsx** | Manual creation only | Manual + AI generation button (calls `generate-group-challenge`) |
| **System Prompts** | Generic GPT-4 prompt | Two specialized prompts (Personal Coach, Group Coordinator) |
| **Database** | 6 tables | 7 tables (add `agent_insights` for communication) |

### File Changes Required:

1. ✅ **Create:** `supabase/functions/generate-group-challenge/index.ts` (new Edge Function)
2. ✅ **Update:** `/project/src/pages/GroupChallenges.tsx` (add AI generation button + logic)
3. ✅ **Update:** `supabase/functions/generate-challenge/index.ts` (improve system prompt)
4. ✅ **Create:** `agent_insights` table in Supabase (SQL migration)

---

## STEP 6: Testing Checklist

After implementing:

### Test Personal Coach Agent:
1. Go to Challenges page
2. Click "Generate AI Challenge"
3. Verify it creates a holistic challenge with exercise + nutrition + sleep guidance
4. Check tone is upbeat, motivating, personalized

### Test Group Coordinator Agent:
1. Go to Group Challenges page
2. Click "AI Generate" button
3. Verify form pre-fills with:
   - Catchy, inclusive title
   - Welcoming description (250-400 words, emojis)
   - Appropriate challenge type and difficulty
   - Max participants suggestion
4. Customize the template
5. Create the challenge
6. Verify it appears in the list

### Test Agent Separation:
1. Personal challenges should be solo, holistic, lifestyle-focused
2. Group challenges should be community-driven, inclusive, event-focused
3. Both should have distinct personalities (Personal = coach, Group = hype coordinator)

---

## Quick Implementation Order:

**If you want to implement incrementally:**

1. **Phase 1 (Quickest Win):** Update GroupChallenges.tsx with AI button + create generate-group-challenge Edge Function
2. **Phase 2:** Improve generate-challenge Edge Function with better Personal Coach prompt
3. **Phase 3:** Add agent_insights table for communication between agents (future enhancement)

---

## Cost Considerations:

- Each AI generation = 1 OpenAI API call (~$0.01-0.03 per call with GPT-4)
- Personal challenges: Individual user cost
- Group challenges: One person creates, many benefit (cost-efficient)
- Consider caching common templates to reduce API calls

---

Would you like me to create the actual code files for you, or do you want to implement these changes yourself step-by-step?
