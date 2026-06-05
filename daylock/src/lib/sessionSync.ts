import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { ensureProfile, isOnboardingComplete, profileToAppUser, displayNameFromAuthUser } from './profile'
import { useAuthStore } from '../store/useAuthStore'
import { useTaskStore } from '../store/useTaskStore'
import { useGymStore } from '../store/useGymStore'
import { useNutritionStore } from '../store/useNutritionStore'
import { shouldReset, setLastResetDate } from './utils'
import { startupLog } from './startupLog'

export type SessionSyncResult = {
  onboardingCompleted: boolean
}

let userDataLoadGeneration = 0

export async function syncAuthSession(session: Session): Promise<SessionSyncResult> {
  startupLog('syncAuthSession start', { userId: session.user.id })
  const name = displayNameFromAuthUser(session.user)

  let profile
  try {
    profile = await ensureProfile(session.user.id, name)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('Failed to sync auth session — profile error:', err)
    }
    clearAuthStores()
    throw err
  }

  const user = profileToAppUser(session, profile)
  const onboardingCompleted = isOnboardingComplete(profile)

  useAuthStore.getState().setUser(user)
  useAuthStore.getState().setIsAuthenticated(true)
  useAuthStore.getState().setOnboardingCompleted(onboardingCompleted)

  if (profile?.gym_level) {
    useGymStore.getState().setGymLevel(profile.gym_level)
  }

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

    startupLog('loadTodayNutrition start', { userId })
    await useNutritionStore.getState().loadTodayNutrition(userId)
    startupLog('loadTodayNutrition done', { userId })

    if (generation !== userDataLoadGeneration) {
      startupLog('loadUserDataStores aborted (stale after loadTodayNutrition)', { generation })
      return
    }

    if (shouldReset()) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayIso = yesterday.toISOString().split('T')[0]

      const { data: yesterdayCompletions } = await supabase
        .from('task_completions')
        .select('task_id, completed')
        .eq('user_id', userId)
        .eq('date', yesterdayIso)

      const completedYesterday = new Set(
        (yesterdayCompletions ?? [])
          .filter((c: { completed: boolean }) => c.completed)
          .map((c: { task_id: string }) => c.task_id)
      )

      const currentTasks = useTaskStore.getState().tasks
      for (const task of currentTasks) {
        if (task.streak > 0 && !completedYesterday.has(task.id)) {
          await supabase
            .from('tasks')
            .update({ streak: 0 })
            .eq('id', task.id)
            .eq('user_id', userId)

          useTaskStore.setState((s) => ({
            streaks: { ...s.streaks, [task.id]: 0 },
            tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, streak: 0 } : t)),
          }))
        }
      }

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
  sessionStorage.removeItem('daylock-workout-start')
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
  useNutritionStore.setState({
    todayLog: null,
    userId: null,
    isLoading: false,
  })
}
