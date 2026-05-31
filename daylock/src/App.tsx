import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { supabase } from './lib/supabase'
import { getPostAuthPath } from './lib/profile'
import { clearAuthStores, syncSessionToStores } from './lib/sessionSync'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/Auth/LoginPage'
import { SignupPage } from './pages/Auth/SignupPage'
import AuthCallback from './pages/Auth/AuthCallback'
import { OnboardingPage } from './pages/Onboarding/OnboardingPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { GymPage } from './pages/Gym/GymPage'
import { StatsPage } from './pages/Stats/StatsPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import './App.css'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function AuthLoadingScreen() {
  return (
    <div className="w-full h-screen bg-[#0B0F0A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#1F2A19] border-t-[#A3E635] animate-spin" />
        <p className="text-sm text-[#94A37A]">Loading session...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted)

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (onboardingCompleted !== true) {
    return <Navigate to="/onboarding" replace />
  }

  return <AppShell>{children}</AppShell>
}

function OnboardingRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted)

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (onboardingCompleted === true) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function GuestRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted)

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to={getPostAuthPath(onboardingCompleted === true)} replace />
  }

  return <>{children}</>
}

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted)

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getPostAuthPath(onboardingCompleted === true)} replace />
}

function AppRouter() {
  const navigate = useNavigate()
  const setIsLoading = useAuthStore((state) => state.setIsLoading)

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('access_token')) {
      window.history.replaceState(null, '', window.location.pathname)
    }

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const { onboardingCompleted } = await syncSessionToStores(session)

          const currentPath = window.location.pathname
          if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
            navigate(getPostAuthPath(onboardingCompleted), { replace: true })
          }
        } else {
          clearAuthStores()
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Session init error:', err)
        }
        clearAuthStores()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (import.meta.env.DEV) {
        console.debug('Auth event:', event)
      }

      if (window.location.pathname === '/auth/callback') {
        return
      }

      if (event === 'SIGNED_IN' && session) {
        try {
          const { onboardingCompleted } = await syncSessionToStores(session)
          const authPaths = ['/login', '/signup', '/']
          if (authPaths.includes(window.location.pathname)) {
            navigate(getPostAuthPath(onboardingCompleted), { replace: true })
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error('Auth state change error:', err)
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        clearAuthStores()
        setIsLoading(false)
        navigate('/login', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, setIsLoading])

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gym"
        element={
          <ProtectedRoute>
            <GymPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return <AppRouter />
}

export default App
