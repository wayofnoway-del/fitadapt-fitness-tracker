import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // FETCH USER PROFILE
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // FETCH USER'S RECENT WORKOUTS (last 10)
    const { data: recentWorkouts } = await supabaseAdmin
      .from('workouts')
      .select('workout_type, duration, distance, intensity, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // FETCH USER'S CURRENT GOALS
    const { data: currentGoals } = await supabaseAdmin
      .from('goals')
      .select('title, category, target_value, unit, current_progress')
      .eq('user_id', user.id)
      .eq('completed', false)

    // Build rich context for AI
    const fitnessLevel = profile?.fitness_level || 'intermediate'
    const preferredActivities = profile?.preferred_activities?.join(', ') || 'various activities'
    const userAge = profile?.age || 'unknown'
    const userWeight = profile?.weight || 'unknown'

    const workoutSummary = recentWorkouts && recentWorkouts.length > 0
      ? recentWorkouts.map(w => `${w.workout_type} (${w.duration}min, ${w.intensity})`).join('; ')
      : 'No recent workouts'

    const goalsSummary = currentGoals && currentGoals.length > 0
      ? currentGoals.map(g => `${g.title} - ${g.current_progress}/${g.target_value} ${g.unit}`).join('; ')
      : 'No active goals'

    // Call OpenAI with detailed user context
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = "You are a Personal Fitness Coach AI creating individualized wellness challenges. Analyze the user's fitness level, recent activity patterns, and goals to design creative, achievable challenges that push them slightly beyond their current performance. Be specific with numbers and timelines. Return ONLY valid JSON with no markdown formatting."

    const userPrompt = `Create a personalized 7-day fitness challenge for this user:

PROFILE:
- Fitness Level: ${fitnessLevel}
- Age: ${userAge}
- Weight: ${userWeight}kg
- Preferred Activities: ${preferredActivities}

RECENT WORKOUTS (last 10):
${workoutSummary}

CURRENT GOALS:
${goalsSummary}

Based on this data, create a challenge that:
1. Aligns with their fitness level and goals
2. Builds on their recent workout patterns
3. Introduces slight progressive overload
4. Is specific and measurable
5. Lasts 7 days from today

Return JSON format:
{
  "title": "Challenge name",
  "description": "Detailed description (2-3 sentences)",
  "difficulty": "easy|medium|hard",
  "duration_days": 7,
  "challenge_data": {
    "workout_count": number,
    "total_distance": number (km, if applicable),
    "total_duration": number (minutes)
  }
}`

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    })

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json()
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`)
    }

    const aiData = await openAiResponse.json()
    const aiContent = aiData.choices[0].message.content.trim()

    // Remove markdown code blocks if present
    const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const challengeData = JSON.parse(cleanedContent)

    // Calculate dates
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + (challengeData.duration_days || 7))

    // Insert challenge into database
    const { data: newChallenge, error: insertError } = await supabaseAdmin
      .from('challenges')
      .insert([
        {
          user_id: user.id,
          title: challengeData.title,
          description: challengeData.description,
          difficulty: challengeData.difficulty,
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          completed: false,
          ai_generated: true,
          challenge_data: challengeData.challenge_data,
        },
      ])
      .select()
      .single()

    if (insertError) {
      throw new Error('Database insert error: ' + insertError.message)
    }

    return new Response(
      JSON.stringify({ success: true, challenge: newChallenge }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
