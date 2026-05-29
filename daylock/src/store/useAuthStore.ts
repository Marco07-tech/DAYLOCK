import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types/index'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      set({ user: null, isAuthenticated: false })
    }
  })

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

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

        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        const newUser: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || email.split('@')[0],
        }

        set({
          user: newUser,
          isAuthenticated: true,
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
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name,
              created_at: new Date().toISOString(),
            })
            .single()
        }

        const newUser: User = {
          id: data.user!.id,
          email,
          name,
        }

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Signup failed'
        set({ error: message, isLoading: false })
      }
    },

    logout: async () => {
      try {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false })
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
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.email!.split('@')[0],
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          set({ isAuthenticated: false, isLoading: false })
        }
      } catch (err) {
        console.error('Auth initialization failed:', err)
        set({ isAuthenticated: false, isLoading: false })
      }
    },

    clearError: () => {
      set({ error: null })
    },
  }
})
