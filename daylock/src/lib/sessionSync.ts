import type { Session } from '@supabase/supabase-js'
import { ensureProfile, isOnboardingComplete, profileToAppUser, displayNameFromAuthUser } from './profile'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import { useGymStore } from '../store/useGymStore'
import { shouldReset, setLastResetDate } from './utils'
import { startupLog } from './startupLog'

export type SessionSyncResult = {
  onboardingCompleted: boolean
}

let userDataLoadGeneration = 0

export async function syncAuthSession(session: Session): Promise<SessionSyncResult> {
  startupLog('syncAuthSession start', { userId: session.user.id })
  const name = displayNameFromAuthUser(session.user)

  const profile = await ensureProfile(session.user.id, name)
  const user = profileToAppUser(session, profile)
  const onboardingCompleted = isOnboardingComplete(profile)

  useAuthStore.getState().setUser(user)
  useAuthStore.getState().setIsAuthenticated(true)
  useAuthStore.getState().setOnboardingCompleted(onboardingCompleted)

  startupLog('syncAuthSession done', { onboardingCompleted, userId: session.user.id })
  return { onboardingCompleted }
}

export async function loadUserDataStores(userId: string): Promise<void> {
  const generation = ++userDataLoadGeneration
  startupLog('loadUserDataStores start', { userId, generation })

  try {
    startupLog('loadTasks start', { userId })
    await useTaskStore.getState().loadTasks(userId)
    startupLog('loadTasks done', { userId })

    if (generation !== userDataLoadGeneration) {
      startupLog('loadUserDataStores aborted (stale after loadTasks)', { generation })
      return
    }

    startupLog('loadGymSplit start', { userId })
    await useGymStore.getState().loadGymSplit(userId)
    startupLog('loadGymSplit done', { userId })

    if (generation !== userDataLoadGeneration) {
      startupLog('loadUserDataStores aborted (stale after loadGymSplit)', { generation })
      return
    }

    startupLog('loadTodayWorkout start', { userId })
    await useGymStore.getState().loadTodayWorkout(userId)
    startupLog('loadTodayWorkout done', { userId })

    if (generation !== userDataLoadGeneration) {
      startupLog('loadUserDataStores aborted (stale after loadTodayWorkout)', { generation })
      return
    }

    if (shouldReset()) {
      await useTaskStore.getState().resetTodayTasks(userId)
      setLastResetDate()
    }

    startupLog('loadUserDataStores done', { userId, generation })
  } catch (err) {
    startupLog('loadUserDataStores error', err)
    throw err
  }
}

export async function syncSessionToStores(
  session: Session,
  options: { loadUserData?: boolean } = {}
): Promise<SessionSyncResult> {
  const { loadUserData = true } = options
  const result = await syncAuthSession(session)
  if (loadUserData) {
    await loadUserDataStores(session.user.id)
  }
  return result
}

export function clearAuthStores(): void {
  userDataLoadGeneration++
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
