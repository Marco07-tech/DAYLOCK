import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      initializeAuth: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                name:
                  session.user.user_metadata?.name ||
                  session.user.email?.split('@')[0] ||
                  '',
              },
              isAuthenticated: true,
            });
          } else {
            // No session found, clear state
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: {
              id: data.user.id,
              email: data.user.email || '',
              name:
                data.user.user_metadata?.name || email.split('@')[0],
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Login failed';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) throw error;

          set({
            user: {
              id: data.user?.id || '',
              email: data.user?.email || '',
              name: name,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Signup failed';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
            },
          });

          if (error) throw error;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Google sign-in failed';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut({ scope: 'local' });
          
          if (error) throw error;

          // Clear all state
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });

          // Clear localStorage completely
          localStorage.removeItem('forge-auth-store');
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Logout failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;
          set({ isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Password reset failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      verifyOTP: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'sms',
          });

          if (error) throw error;

          set({
            user: {
              id: data.user?.id || '',
              email: data.user?.email || '',
              name: data.user?.user_metadata?.name || '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'OTP verification failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email',
          });

          if (error) throw error;

          set({
            user: {
              id: data.user?.id || '',
              email: data.user?.email || '',
              name: data.user?.user_metadata?.name || '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Email verification failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'forge-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
