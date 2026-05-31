import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types/index'

type ProfileRecord = {
  id: string
  name: string
  created_at?: string
  onboarding_completed?: boolean
}

async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }

  return (data as ProfileRecord | null) ?? null
}

async function ensureProfile(userId: string, name: string): Promise<ProfileRecord | null> {
  const profile = await fetchProfile(userId)
  if (profile) {
    return profile
  }

  const createdAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name,
      onboarding_completed: false,
      created_at: createdAt,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create profile:', error)
    return null
  }

  return data as ProfileRecord
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  onboardingCompleted: boolean | null
  setUser: (user: User | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
  checkOnboarding: (userId: string) => Promise<boolean>
  updateUserName: (name: string) => void
  setOnboardingCompleted: (completed: boolean | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    onboardingCompleted: null,

    setUser: (user: User | null) => {
      set({ user })
    },

    setIsAuthenticated: (isAuthenticated: boolean) => {
      set({ isAuthenticated })
    },

    setIsLoading: (isLoading: boolean) => {
      set({ isLoading })
    },

    checkOnboarding: async (userId: string) => {
      const profile = await fetchProfile(userId)
      return profile?.onboarding_completed ?? false
    },

    updateUserName: (name: string) => {
      set((state) =>
        state.user
          ? {
              user: {
                ...state.user,
                name,
              },
            }
          : state
      )
    },

    setOnboardingCompleted: (completed: boolean | null) => {
      set({ onboardingCompleted: completed })
    },

    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          set({ error: error.message, isLoading: false })
          return
        }

        const profile = await ensureProfile(
          data.user.id,
          data.user.user_metadata?.name || email.split('@')[0]
        )

        const newUser: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
        }

        set({
          user: newUser,
          isAuthenticated: true,
          onboardingCompleted: profile?.onboarding_completed ?? false,
          isLoading: false,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        set({ error: message, isLoading: false })
      }
    },

    signup: async (email: string, password: string, name: string) => {
      try {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        })

        if (error) {
          set({ error: error.message, isLoading: false })
          return
        }

        // Create profile record
        if (data.user?.id) {
          const profile = await ensureProfile(data.user.id, name)

          const newUser: User = {
            id: data.user.id,
            email,
            name: profile?.name || name,
          }

          set({
            user: newUser,
            isAuthenticated: true,
            onboardingCompleted: profile?.onboarding_completed ?? false,
            isLoading: false,
          })

          return
        }

        set({ isLoading: false })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Signup failed'
        set({ error: message, isLoading: false })
      }
    },

    logout: async () => {
      try {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false, onboardingCompleted: null, isLoading: false })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Logout failed'
        set({ error: message })
      }
    },

    initAuth: async () => {
      try {
        set({ isLoading: true })
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await ensureProfile(
            session.user.id,
            session.user.user_metadata?.name || session.user.email!.split('@')[0]
          )

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
          }

          set({
            user,
            isAuthenticated: true,
            onboardingCompleted: profile?.onboarding_completed ?? false,
            isLoading: false,
          })
        } else {
          set({ isAuthenticated: false, onboardingCompleted: null, isLoading: false })
        }
      } catch (err) {
        console.error('Auth initialization failed:', err)
        set({ isAuthenticated: false, onboardingCompleted: null, isLoading: false })
      }
    },

    clearError: () => {
      set({ error: null })
    },
  }
})
