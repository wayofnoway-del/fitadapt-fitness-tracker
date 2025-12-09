// FitAdapt Group Challenge Coordinator Edge Function
// Deploy this to Supabase: Dashboard → Edge Functions → New Function → generate-group-challenge

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
    const systemPrompt = 'You are the FitAdapt Group Challenge Coordinator - a dynamic, community-building AI that transforms individual fitness journeys into powerful collective experiences through perfectly orchestrated group workout events. Your personality: Energetic event planner, inclusive community builder, strategic coordinator, encouraging facilitator, adaptive and observant. You design group fitness challenges that bring people together, leverage collective motivation, and create memorable shared experiences where everyone - regardless of fitness level - feels challenged, included, and inspired. Make every invitation enthusiastic, welcoming, and community-focused with emojis and upbeat language!'

    const part1 = 'Create an exciting, inclusive group fitness challenge invitation for a '
    const part2 = ' level fitness enthusiast. Their recent activities: '
    const part3 = '. Their goals: '
    const part4 = '. Generate a compelling group challenge that would attract mixed fitness levels and build community. The challenge should have: 1) A catchy, motivating title (5-8 words), 2) An inclusive description that welcomes all fitness levels (250-400 words, upbeat tone, use emojis, explain pace groups), 3) Suggested challenge type (running, cycling, hiking, yoga, circuit training), 4) Difficulty level (beginner-friendly, all-levels, intermediate, or advanced), 5) Suggested location type (park, trail, gym, outdoor space), 6) Duration in minutes (60-90), 7) Max participants (10-20), 8) What to bring, 9) Why join (community, accountability, fun). Return ONLY valid JSON with this structure: '

    const exampleJson = {
      title: "Saturday Sunrise 5K Social Run & Coffee",
      description: "🌅 Join us for an energizing start to the weekend! We'll run a scenic 5K loop through the park, then grab coffee together at the cafe. 👟 WHO: All paces welcome! We'll have 3 pace groups: Relaxed (7:30-8:30 min/km) - chat and enjoy views, Moderate (6:30-7:30 min/km) - steady effort, Spirited (5:30-6:30 min/km) - push the pace. ✨ WHY JOIN: Accountability, discover new routes, make fitness friends, start weekend feeling accomplished!",
      challenge_type: "running",
      difficulty: "all-levels",
      location_suggestion: "Riverside Park or similar scenic park with 5K loop",
      duration_minutes: 75,
      max_participants: 15,
      equipment_needed: "Water bottle, running shoes, positive vibes!",
      why_join: "Accountability keeps you showing up, discover new routes with local runners, make fitness friends who get it, start your weekend feeling accomplished"
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
