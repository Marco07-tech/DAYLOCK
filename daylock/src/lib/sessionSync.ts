import type { Session } from '@supabase/supabase-js'
import { ensureProfile, isOnboardingComplete, profileToAppUser } from './profile'
import { displayNameFromAuthUser } from './profile'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import { useGymStore } from '../store/useGymStore'
import { shouldReset, setLastResetDate } from './utils'

export type SessionSyncResult = {
  onboardingCompleted: boolean
}

/**
 * Applies a Supabase session to Zustand auth state and optionally loads user data.
 */
export async function syncSessionToStores(
  session: Session,
  options: { loadUserData?: boolean } = {}
): Promise<SessionSyncResult> {
  const { loadUserData = true } = options
  const name = displayNameFromAuthUser(session.user)
  const profile = await ensureProfile(session.user.id, name)
  const user = profileToAppUser(session, profile)
  const onboardingCompleted = isOnboardingComplete(profile)

  useAuthStore.getState().setUser(user)
  useAuthStore.getState().setIsAuthenticated(true)
  useAuthStore.getState().setOnboardingCompleted(onboardingCompleted)

  if (loadUserData) {
    const userId = session.user.id
    await Promise.all([
      useTaskStore.getState().loadTasks(userId),
      useGymStore.getState().loadGymSplit(userId),
      useGymStore.getState().loadTodayWorkout(userId),
    ])

    if (shouldReset()) {
      await useTaskStore.getState().resetTodayTasks(userId)
      setLastResetDate()
    }
  }

  return { onboardingCompleted }
}

export function clearAuthStores(): void {
  useAuthStore.getState().setUser(null)
  useAuthStore.getState().setIsAuthenticated(false)
  useAuthStore.getState().setOnboardingCompleted(null)
  useTaskStore.setState({
    tasks: [],
    todayLog: {},
    streaks: {},
    userId: null,
    isLoading: false,
  })
  useGymStore.setState({
    todayWorkout: null,
    workoutHistory: [],
    userId: null,
    isLoading: false,
  })
}
