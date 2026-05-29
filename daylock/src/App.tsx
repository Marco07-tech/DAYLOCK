import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useTaskStore } from './store/useTaskStore'
import { useGymStore } from './store/useGymStore'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/Auth/LoginPage'
import { SignupPage } from './pages/Auth/SignupPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { GymPage } from './pages/Gym/GymPage'
import { StatsPage } from './pages/Stats/StatsPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import './App.css'

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell>{children}</AppShell>
}

// Root redirect component
function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export function App() {
  const [appLoading, setAppLoading] = useState(true)
  const initAuth = useAuthStore((state) => state.initAuth)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const authIsLoading = useAuthStore((state) => state.isLoading)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const loadGymSplit = useGymStore((state) => state.loadGymSplit)
  const loadTodayWorkout = useGymStore((state) => state.loadTodayWorkout)

  useEffect(() => {
    // Initialize auth on mount
    const initializeAuth = async () => {
      await initAuth()
    }
    initializeAuth()
  }, [initAuth])

  // Load user data after auth is initialized
  useEffect(() => {
    if (!authIsLoading && isAuthenticated && user) {
      const loadUserData = async () => {
        try {
          await loadTasks(user.id)
          await loadGymSplit(user.id)
          await loadTodayWorkout(user.id)
        } catch (err) {
          console.error('Failed to load user data:', err)
        }
      }
      loadUserData()
    }
  }, [authIsLoading, isAuthenticated, user])

  // Set app loading to false once auth has been checked
  useEffect(() => {
    if (!authIsLoading) {
      setAppLoading(false)
    }
  }, [authIsLoading])

  if (appLoading) {
    return (
      <div className="w-full h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold font-display text-accent-lime mb-2">DayLock</h1>
          <p className="text-text-secondary text-sm">Lock in your daily routine</p>
        </div>
        <div className="flex gap-1.5 mt-4">
          <div
            className="w-2 h-2 rounded-full bg-accent-lime opacity-60"
            style={{
              animation: 'pulse 1.5s infinite 0s',
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-accent-lime opacity-60"
            style={{
              animation: 'pulse 1.5s infinite 0.3s',
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-accent-lime opacity-60"
            style={{
              animation: 'pulse 1.5s infinite 0.6s',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
    </Router>
  )
}
