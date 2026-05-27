import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardApp } from '@/screens/DashboardApp'
import { OnboardingScreen } from '@/screens/OnboardingScreen'

// Auth Screens
import { LoginScreen } from '@/screens/auth/LoginScreen'
import { SignupScreen } from '@/screens/auth/SignupScreen'
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen'
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen'
import { OTPVerificationScreen } from '@/screens/auth/OTPVerificationScreen'
import { EmailVerificationScreen } from '@/screens/auth/EmailVerificationScreen'

export default function App() {
  const { isAuthenticated, user } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    console.log('🔧 Setting up auth listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('📢 Auth event:', event, 'User:', session?.user?.email)

        try {
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            console.log('🔄 Processing INITIAL_SESSION or SIGNED_IN...')
            if (session?.user) {
              console.log('✅ User exists, setting auth state...')
              // Set auth state immediately
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

              // For new OAuth users, always show onboarding first
              // OnboardingScreen will create the users table entry
              console.log('ℹ️ Defaulting to onboarding for new user')
              setNeedsOnboarding(true)
            } else {
              console.log('ℹ️ INITIAL_SESSION with no user (not logged in)')
              // INITIAL_SESSION with no user = not logged in
              useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
              setNeedsOnboarding(false)
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🔓 User signed out')
            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
              error: null,
              isLoading: false,
            })
            setNeedsOnboarding(false)
          } else {
            console.log('⏭️ Other event, skipping handler:', event)
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error)
          // Even on error, set basic auth state from session
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
            // Default to onboarding on error
            setNeedsOnboarding(true)
          }
        } finally {
          // ALWAYS stop loading, no matter what happens
          console.log('✅ Setting isInitializing to false')
          setIsInitializing(false)
        }
      }
    )

    // Fallback timeout (for cases where onAuthStateChange doesn't fire)
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Auth initialization timeout reached')
      setIsInitializing(false)
    }, 5000)

    return () => {
      console.log('🧹 Cleaning up auth listener')
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
          element={
            isAuthenticated && !needsOnboarding
              ? <Navigate to="/dashboard" replace />
              : isAuthenticated && needsOnboarding
              ? <Navigate to="/onboarding" replace />
              : <LoginScreen />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated && !needsOnboarding
              ? <Navigate to="/dashboard" replace />
              : isAuthenticated && needsOnboarding
              ? <Navigate to="/onboarding" replace />
              : <SignupScreen />
          }
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

        {/* Onboarding Route */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              <OnboardingScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          }
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
            ) : isAuthenticated && needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : isAuthenticated && !needsOnboarding ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
