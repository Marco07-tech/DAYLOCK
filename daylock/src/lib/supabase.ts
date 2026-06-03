import { createClient } from '@supabase/supabase-js'

export type DbExercise = {
  id: string
  name: string
  muscleGroup: string
  sets: Array<{
    id: string
    reps: number
    weight: number
    done: boolean
  }>
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})

/**
 * Shared Google OAuth sign-in flow.
 * Redirects to Google login and then back to /auth/callback.
 */
const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      skipBrowserRedirect: false,
    },
  })

  if (error) throw error
  return data
}

/**
 * Dev-only: verifies that RLS is enabled on the profiles table.
 * If the query returns multiple rows, RLS may not be active.
 */
export async function verifyRLS(): Promise<void> {
  const { data, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(5)

  if (error) {
    console.error('[SECURITY] Could not verify RLS on profiles table:', error.message)
    return
  }

  if (data && data.length > 1) {
    console.error(
      '[SECURITY] RLS may not be enabled on the profiles table —',
      'query returned', data.length, 'rows with anon key.',
      'Run the Supabase migration to enable RLS.'
    )
  }
}

export type Database = {
  profiles: {
    id: string
    name: string
    goal: string | null
    onboarding_completed: boolean
    created_at: string
  }
  tasks: {
    id: string
    user_id: string
    type: string
    name: string
    icon: string
    meta: string
    streak: number
    done: boolean
    scheduled_days: string[]
    scheduled_time: string
    created_at: string
  }
  task_completions: {
    id: string
    user_id: string
    task_id: string
    date: string
    completed: boolean
    created_at: string
  }
  gym_splits: {
    id: string
    user_id: string
    day_name: string
    split_name: string
  }
  workout_logs: {
    id: string
    user_id: string
    date: string
    split_name: string
    exercises: DbExercise[]
    completed: boolean
    created_at: string
  }
  daily_logs: {
    id: string
    user_id: string
    date: string
    completion_percent: number
    tasks_done: number
    tasks_total: number
  }
  nutrition_logs: {
    id: string
    user_id: string
    date: string
    calories_goal: number
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
  }
}
