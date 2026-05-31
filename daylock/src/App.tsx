import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useTaskStore } from './store/useTaskStore'
import { useGymStore } from './store/useGymStore'
import { supabase } from './lib/supabase'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/Auth/LoginPage'
import { SignupPage } from './pages/Auth/SignupPage'
import { OnboardingPage } from './pages/Onboarding/OnboardingPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { GymPage } from './pages/Gym/GymPage'
import { StatsPage } from './pages/Stats/StatsPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import './App.css'

// Protected Route Component
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

  if (onboardingCompleted === false) {
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

// Root redirect component
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

  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

function AppRouter() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated)
  const setIsLoading = useAuthStore((state) => state.setIsLoading)
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const loadGymSplit = useGymStore((state) => state.loadGymSplit)
  const loadTodayWorkout = useGymStore((state) => state.loadTodayWorkout)

  useEffect(() => {
    // Handle OAuth callback - check for tokens in URL hash
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = hashParams.get('access_token')

    if (accessToken) {
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname)
    }

    // Initialize auth on mount
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name:
              profile?.name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'User',
          })
          setIsAuthenticated(true)

          await Promise.all([
            loadTasks(session.user.id),
            loadGymSplit(session.user.id),
            loadTodayWorkout(session.user.id),
          ])

          const onboardingDone = profile?.onboarding_completed ?? false
          setOnboardingCompleted(onboardingDone)

          if (!onboardingDone) {
            navigate('/onboarding', { replace: true })
          } else {
            const currentPath = window.location.pathname
            if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
              navigate('/dashboard', { replace: true })
            }
          }
        } catch (err) {
          console.error('Session init error:', err)
        }
      }

      setIsLoading(false)
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name:
              profile?.name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'User',
          })
          setIsAuthenticated(true)

          await Promise.all([
            loadTasks(session.user.id),
            loadGymSplit(session.user.id),
            loadTodayWorkout(session.user.id),
          ])

          const onboardingDone = profile?.onboarding_completed ?? false
          setOnboardingCompleted(onboardingDone)

          if (!onboardingDone) {
            navigate('/onboarding', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        } catch (err) {
          console.error('Auth state change error:', err)
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        setOnboardingCompleted(null)
        navigate('/login', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [
    loadGymSplit,
    loadTasks,
    loadTodayWorkout,
    navigate,
    setIsAuthenticated,
    setIsLoading,
    setOnboardingCompleted,
    setUser,
  ])

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
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
    </Routes>
  )
}

export function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  )
}
