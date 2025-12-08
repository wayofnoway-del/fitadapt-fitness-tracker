import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript types matching the database schema
export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | null
  age: number | null
  weight: number | null
  height: number | null
  preferred_activities: string[] | null
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  goal_type: string | null
  target_value: number
  current_value: number
  unit: string | null
  deadline: string | null
  status: string
  created_at: string
}

export type Workout = {
  id: string
  user_id: string
  workout_date: string
  workout_type: string
  duration: number | null
  distance: number | null
  calories: number | null
  intensity: 'light' | 'moderate' | 'intense' | null
  notes: string | null
  created_at: string
}

export type FitnessSummary = {
  total_workouts: number
  total_distance: number
  total_duration: number
  total_calories: number
  recent_streak: number
  active_goals: number
}
