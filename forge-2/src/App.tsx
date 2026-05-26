import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardApp } from '@/screens/DashboardApp'

// Auth Screens
import { LoginScreen } from '@/screens/auth/LoginScreen'
import { SignupScreen } from '@/screens/auth/SignupScreen'
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen'
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen'
import { OTPVerificationScreen } from '@/screens/auth/OTPVerificationScreen'
import { EmailVerificationScreen } from '@/screens/auth/EmailVerificationScreen'

export default function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('📢 Auth event:', event, 'User:', session?.user?.email)

        if (event === 'INITIAL_SESSION') {
          // INITIAL_SESSION with no session just means "not logged in yet"
          // Do NOT treat this as sign-out — just stop initializing
          if (session?.user) {
            useAuthStore.setState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                name:
                  session.user.user_metadata?.name ||
                  session.user.email?.split('@')[0] ||
                  '',
              },
              isAuthenticated: true,
              isLoading: false,
            })
          }
          // Always stop initializing on INITIAL_SESSION regardless
          setIsInitializing(false)
          return // Exit early, don't fall through to SIGNED_OUT check
        }

        if (event === 'SIGNED_OUT') {
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          })
          setIsInitializing(false)
          return
        }

        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          if (session?.user) {
            useAuthStore.setState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                name:
                  session.user.user_metadata?.name ||
                  session.user.email?.split('@')[0] ||
                  '',
              },
              isAuthenticated: true,
              isLoading: false,
            })
          }
          setIsInitializing(false)
        }
      }
    )

    // Fallback timeout (for cases where onAuthStateChange doesn't fire)
    const timeoutId = setTimeout(() => {
      setIsInitializing(false)
    }, 5000)

    return () => {
      subscription?.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  // Show loading spinner while initializing auth
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-[var(--color-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupScreen />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordScreen />}
        />
        <Route
          path="/reset-password"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordScreen />}
        />
        <Route
          path="/verify-otp"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <OTPVerificationScreen />}
        />
        <Route
          path="/verify-email"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <EmailVerificationScreen />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardApp />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isInitializing ? (
              <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                  <p className="text-[var(--color-muted)]">Loading...</p>
                </div>
              </div>
            ) : (
              <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
