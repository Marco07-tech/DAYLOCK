import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../lib/profile'
import { syncSessionToStores } from '../lib/sessionSync'
import type { User } from '../types/index'

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

        if (!data.session) {
          set({ error: 'Unable to start session. Please try again.', isLoading: false })
          return
        }

        await syncSessionToStores(data.session)
        set({ isLoading: false })
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

        if (!data.user?.id) {
          set({ isLoading: false })
          return
        }

        if (!data.session) {
          set({
            error: 'Account created. Check your email to confirm, then sign in.',
            isLoading: false,
            isAuthenticated: false,
          })
          return
        }

        await syncSessionToStores(data.session)
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

    clearError: () => {
      set({ error: null })
    },
  }
})
