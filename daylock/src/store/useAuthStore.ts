import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Profile {
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
}

interface AuthState {
  user: import('@supabase/supabase-js').User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  loadProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true })
        await get().loadProfile(session.user.id)
      }
      set({ isLoading: false })

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({ user: session.user, isAuthenticated: true })
          await get().loadProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, isAuthenticated: false })
        }
      })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
      set({ isLoading: false })
    }
  },

  signInWithGoogle: async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL ?? window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, profile: null, isAuthenticated: false })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  loadProfile: async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, calorie_goal, protein_goal, water_goal, body_weight, fitness_goal, gym_level, onboarding_completed')
        .eq('id', userId)
        .single()

      if (data) {
        set({ profile: data as unknown as Profile })
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const newProfile = {
            id: userId,
            email: user.email ?? '',
            display_name: user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            calorie_goal: 1800,
            protein_goal: 160,
            water_goal: 8,
            body_weight: null,
            fitness_goal: 'maintenance' as const,
            gym_level: 'beginner' as const,
            onboarding_completed: false,
          }
          await supabase.from('profiles').insert(newProfile)
          set({ profile: newProfile })
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { profile } = get()
      if (!profile) return
      await supabase.from('profiles').update(updates).eq('id', profile.id)
      set({ profile: { ...profile, ...updates } })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },
}))
