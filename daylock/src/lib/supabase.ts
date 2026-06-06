import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          calorie_goal: number
          protein_goal: number
          water_goal: number
          body_weight: number | null
          fitness_goal: 'cutting' | 'bulking' | 'maintenance'
          gym_level: 'beginner' | 'experienced'
          onboarding_completed: boolean
          created_at: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          name: string
          muscle_group: string
          is_custom: boolean
          created_at: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          duration_minutes: number | null
          completed: boolean
          created_at: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          session_id: string
          user_id: string
          exercise_id: string
          exercise_name: string
          muscle_group: string
          set_number: number
          weight_kg: number | null
          reps: number | null
          done: boolean
          created_at: string
        }
      }
      weekly_split: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          workout_name: string
          is_rest: boolean
        }
      }
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          calorie_goal: number
          breakfast_kcal: number
          lunch_kcal: number
          dinner_kcal: number
          snacks_kcal: number
          protein_goal: number
          breakfast_protein: number
          lunch_protein: number
          dinner_protein: number
          snacks_protein: number
          water_glasses: number
          water_goal: number
          created_at: string
        }
      }
      body_weight_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          logged_at: string
        }
      }
    }
  }
}
