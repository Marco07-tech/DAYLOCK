import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { useAuthStore } from './store/useAuthStore'
import { supabase, verifyRLS } from './lib/supabase'
import { getPostAuthPath } from './lib/profile'
import { clearAuthStores, syncAuthSession, loadUserDataStores } from './lib/sessionSync'
import { startupLog } from './lib/startupLog'

if (import.meta.env.DEV) {
  verifyRLS()
}
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

  useEffect(() => {
    startupLog('App auth effect mounted', { path: window.location.pathname })
    let cancelled = false

    const finishAuthLoading = () => {
      startupLog('setIsLoading(false)')
      useAuthStore.getState().setIsLoading(false)
    }

    const applySession = (session: Session | null, source: string) => {
      startupLog('applySession invoked', { source, hasSession: !!session, userId: session?.user?.id })

      void (async () => {
        try {
          if (session) {
            const { onboardingCompleted } = await syncAuthSession(session)

            const path = window.location.pathname
            if (!cancelled && (path === '/login' || path === '/signup' || path === '/')) {
              navigate(getPostAuthPath(onboardingCompleted), { replace: true })
            }

            if (source === 'INITIAL_SESSION' || source === 'SIGNED_IN') {
              finishAuthLoading()
              void loadUserDataStores(session.user.id).catch((err) => {
                startupLog('loadUserDataStores failed', err)
              })
            }
          } else {
            clearAuthStores()
            finishAuthLoading()
          }
        } catch (err) {
          startupLog('applySession error', { source, err })
          clearAuthStores()
          finishAuthLoading()
        }
      })()
    }

    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('access_token')) {
      window.history.replaceState(null, '', window.location.pathname)
    }

    startupLog('onAuthStateChange registering')

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        startupLog('INITIAL_SESSION received', {
          hasSession: !!session,
          userId: session?.user?.id,
        })
      } else {
        startupLog('onAuthStateChange event', { event, hasSession: !!session })
      }

      if (event === 'INITIAL_SESSION') {
        applySession(session, 'INITIAL_SESSION')
        return
      }

      if (event === 'SIGNED_OUT') {
        clearAuthStores()
        finishAuthLoading()
        if (!cancelled) {
          navigate('/login', { replace: true })
        }
        return
      }

      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => {
          if (cancelled) return
          const onAuthPage = ['/login', '/signup', '/'].includes(window.location.pathname)
          const needsSync = onAuthPage || !useAuthStore.getState().isAuthenticated
          if (needsSync) {
            applySession(session, 'SIGNED_IN')
          }
        }, 0)
      }
    })

    startupLog('onAuthStateChange registered')

    setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session }, error }) => {
        startupLog('getSession result', {
          hasSession: !!session,
          userId: session?.user?.id,
          error: error?.message,
        })
      })
    }, 0)

    const safetyTimer = window.setTimeout(() => {
      if (useAuthStore.getState().isLoading) {
        startupLog('safety timeout 15s — setIsLoading(false)')
        finishAuthLoading()
      }
    }, 15_000)

    return () => {
      cancelled = true
      window.clearTimeout(safetyTimer)
      subscription.unsubscribe()
      startupLog('App auth effect cleanup')
    }
  }, [navigate])

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
  startupLog('App mounted')
  return <AppRouter />
}

export default App
