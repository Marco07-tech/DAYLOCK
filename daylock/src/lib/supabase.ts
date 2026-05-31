import { createClient } from '@supabase/supabase-js'

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

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: false,
    },
  })

  if (error) throw error
  return data
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
    exercises: unknown[]
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
}
