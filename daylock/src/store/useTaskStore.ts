import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Task } from '../types/index'
import { getDayName } from '../lib/utils'
import { getTodayIsoDate } from '../lib/dates'
import { syncTrace, traceAwait } from '../lib/syncTrace'

export type DailyLogRow = {
  date: string
  completion_percent: number
  tasks_done: number
  tasks_total: number
}

interface TaskState {
  tasks: Task[]
  todayLog: { [taskId: string]: boolean }
  streaks: { [taskId: string]: number }
  dailyLogs: DailyLogRow[]
  isLoading: boolean
  userId: string | null
  loadTasks: (userId: string) => Promise<void>
  loadDailyLogs: (userId: string, fromDate?: string, toDate?: string) => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'streak' | 'done'>, userId: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'streak'>>, userId: string) => Promise<boolean>
  removeTask: (id: string, userId: string) => Promise<boolean>
  toggleTaskDone: (id: string, userId: string) => Promise<void>
  getTodayTasks: () => Task[]
  getCompletionPercent: () => number
  getBestStreak: () => number
  saveDailyLog: (userId: string) => Promise<void>
  resetTodayTasks: (userId: string) => Promise<void>
  resetAllUserData: (userId: string) => Promise<void>
}

async function loadTodayCompletions(
  userId: string,
  today: string
): Promise<Record<string, boolean>> {
  const { data, error } = await traceAwait('task_completions.select', () =>
    supabase
      .from('task_completions')
      .select('task_id, completed')
      .eq('user_id', userId)
      .eq('date', today)
  )

  if (error) {
    // Table may not exist until migration is applied — fail gracefully
    if (import.meta.env.DEV && error.code !== 'PGRST205') {
      console.error('Failed to load task completions:', error)
    }
    return {}
  }

  const log: Record<string, boolean> = {}
  for (const row of data ?? []) {
    if (row.completed) {
      log[row.task_id] = true
    }
  }
  return log
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [] as Task[],
  todayLog: {} as { [taskId: string]: boolean },
  streaks: {} as { [taskId: string]: number },
  dailyLogs: [] as DailyLogRow[],
  isLoading: false,
  userId: null,

  loadTasks: async (userId: string) => {
    try {
      syncTrace('loadTasks', 'before', { userId })
      set({ isLoading: true, userId })
      const today = getTodayIsoDate()

      const [tasksResult, todayLog] = await Promise.all([
        traceAwait('loadTasks.tasks.select', () =>
          supabase.from('tasks').select('*').eq('user_id', userId).order('created_at')
        ),
        loadTodayCompletions(userId, today),
      ])
      syncTrace('loadTasks.parallel', 'after', {
        taskCount: tasksResult.data?.length ?? 0,
        completionKeys: Object.keys(todayLog).length,
      })

      if (tasksResult.error) {
        if (import.meta.env.DEV) {
          console.error('Failed to load tasks:', tasksResult.error)
        }
        set({ isLoading: false })
        return
      }

      const data = tasksResult.data
      if (data) {
        const tasks: Task[] = data.map((t: {
          id: string
          type: Task['type']
          name: string
          icon: string
          meta: string
          streak: number
          done: boolean
          scheduled_days: string[]
          scheduled_time: string
          created_at: string
        }) => ({
          id: t.id,
          type: t.type,
          name: t.name,
          icon: t.icon,
          meta: t.meta,
          streak: t.streak,
          done: false,
          scheduledDays: t.scheduled_days,
          scheduledTime: t.scheduled_time,
          createdAt: t.created_at,
        }))

        const streaks: { [key: string]: number } = {}
        tasks.forEach((task) => {
          streaks[task.id] = task.streak
        })

        set({ tasks, streaks, todayLog, isLoading: false })
      } else {
        set({ isLoading: false })
      }
      syncTrace('loadTasks', 'after', { userId })
    } catch (err) {
      syncTrace('loadTasks', 'error', err)
      set({ isLoading: false })
    }
  },

  loadDailyLogs: async (userId: string, fromDate?: string, toDate?: string) => {
    try {
      syncTrace('loadDailyLogs', 'before', { userId })
      const end = toDate ?? getTodayIsoDate()
      const start =
        fromDate ??
        (() => {
          const d = new Date()
          d.setDate(d.getDate() - 29)
          return d.toISOString().split('T')[0]
        })()

      const { data, error } = await traceAwait('loadDailyLogs.select', () =>
        supabase
          .from('daily_logs')
          .select('date, completion_percent, tasks_done, tasks_total')
          .eq('user_id', userId)
          .gte('date', start)
          .lte('date', end)
          .order('date')
      )

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to load daily logs:', error)
        }
        return
      }

      set({ dailyLogs: (data as DailyLogRow[]) ?? [] })
      syncTrace('loadDailyLogs', 'after', { rows: data?.length ?? 0 })
    } catch (err) {
      syncTrace('loadDailyLogs', 'error', err)
    }
  },

  addTask: async (task: Omit<Task, 'id' | 'streak' | 'done'>, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          type: task.type,
          name: task.name,
          icon: task.icon,
          meta: typeof task.meta === 'object' ? JSON.stringify(task.meta) : task.meta,
          streak: 0,
          done: false,
          scheduled_days: task.scheduledDays,
          scheduled_time: task.scheduledTime,
        })
        .select()
        .single()

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to add task:', error)
        }
        return
      }

      if (data) {
        const newTask: Task = {
          id: data.id,
          type: data.type,
          name: data.name,
          icon: data.icon,
          meta: data.meta,
          streak: data.streak,
          done: false,
          scheduledDays: data.scheduled_days,
          scheduledTime: data.scheduled_time,
          createdAt: data.created_at,
        }

        set((state) => ({
          tasks: [...state.tasks, newTask],
          streaks: {
            ...state.streaks,
            [data.id]: 0,
          },
        }))
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error adding task:', err)
      }
    }
  },

  toggleTaskDone: async (id: string, userId: string) => {
    try {
      const state = get()
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return

      const wasDoneToday = state.todayLog[id] || false
      const newDone = !wasDoneToday
      const today = getTodayIsoDate()
      const currentStreak = state.streaks[id] || 0
      const newStreak = newDone && !wasDoneToday ? currentStreak + 1 : currentStreak

      set((s) => ({
        todayLog: {
          ...s.todayLog,
          [id]: newDone,
        },
        streaks: {
          ...s.streaks,
          [id]: newStreak,
        },
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, streak: newStreak } : t)),
      }))

      const { error: completionError } = await supabase.from('task_completions').upsert(
        {
          user_id: userId,
          task_id: id,
          date: today,
          completed: newDone,
        },
        { onConflict: 'user_id,task_id,date' }
      )

      if (completionError && import.meta.env.DEV) {
        console.error('Failed to save task completion:', completionError)
      }

      if (newDone && !wasDoneToday) {
        const { error: streakError } = await supabase
          .from('tasks')
          .update({ streak: newStreak })
          .eq('id', id)
          .eq('user_id', userId)

        if (streakError && import.meta.env.DEV) {
          console.error('Failed to update streak:', streakError)
        }
      }

      await get().saveDailyLog(userId)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error toggling task:', err)
      }
    }
  },

  updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'streak'>>, userId: string) => {
    try {
      const state = get()
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return false

      // Optimistically update local state
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
              }
            : t
        ),
      }))

      // Build update object for Supabase
      const dbUpdate: Record<string, any> = {}
      if (updates.name) dbUpdate.name = updates.name
      if (updates.scheduledDays) dbUpdate.scheduled_days = updates.scheduledDays
      if (updates.scheduledTime !== undefined) dbUpdate.scheduled_time = updates.scheduledTime
      if (updates.meta !== undefined) {
        dbUpdate.meta = typeof updates.meta === 'object' ? JSON.stringify(updates.meta) : updates.meta
      }

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdate)
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to update task:', error)
        }
        return false
      }

      // Recompute daily logs if days changed
      if (updates.scheduledDays) {
        await get().saveDailyLog(userId)
      }

      return true
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error updating task:', err)
      }
      return false
    }
  },

  removeTask: async (id: string, userId: string) => {
    try {
      set((state) => {
        const newStreaks = { ...state.streaks }
        delete newStreaks[id]
        const newTodayLog = { ...state.todayLog }
        delete newTodayLog[id]
        return {
          tasks: state.tasks.filter((task) => task.id !== id),
          streaks: newStreaks,
          todayLog: newTodayLog,
        }
      })

      const [taskResult, completionsResult] = await Promise.all([
        supabase.from('tasks').delete().eq('id', id).eq('user_id', userId),
        supabase.from('task_completions').delete().eq('task_id', id).eq('user_id', userId),
      ])

      if (taskResult.error || completionsResult.error) {
        if (import.meta.env.DEV) {
          console.error('Failed to remove task:', taskResult.error ?? completionsResult.error)
        }
        return false
      }

      await get().saveDailyLog(userId)
      return true
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error removing task:', err)
      }
      return false
    }
  },

  getTodayTasks: () => {
    const state = get()
    const today = getDayName()
    return state.tasks.filter((task) => task.scheduledDays.includes(today))
  },

  getCompletionPercent: () => {
    const state = get()
    const todayTasks = get().getTodayTasks()
    if (todayTasks.length === 0) return 0
    const completed = todayTasks.filter((t) => state.todayLog[t.id]).length
    return Math.round((completed / todayTasks.length) * 100)
  },

  getBestStreak: () => {
    const state = get()
    const streaks = Object.values(state.streaks) as number[]
    return streaks.length > 0 ? Math.max(...streaks) : 0
  },

  saveDailyLog: async (userId: string) => {
    try {
      const state = get()
      const todayTasks = get().getTodayTasks()
      const completed = todayTasks.filter((t) => state.todayLog[t.id]).length
      const percent = todayTasks.length > 0 ? Math.round((completed / todayTasks.length) * 100) : 0
      const today = getTodayIsoDate()

      await supabase.from('daily_logs').upsert(
        {
          user_id: userId,
          date: today,
          completion_percent: percent,
          tasks_done: completed,
          tasks_total: todayTasks.length,
        },
        { onConflict: 'user_id,date' }
      )
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error saving daily log:', err)
      }
    }
  },

  resetTodayTasks: async (_userId: string) => {
    set({ todayLog: {} })
  },

  resetAllUserData: async (userId: string) => {
    try {
      await Promise.all([
        supabase.from('task_completions').delete().eq('user_id', userId),
        supabase.from('daily_logs').delete().eq('user_id', userId),
        supabase.from('tasks').delete().eq('user_id', userId),
        supabase.from('workout_logs').delete().eq('user_id', userId),
        supabase.from('gym_splits').delete().eq('user_id', userId),
      ])

      set({
        tasks: [],
        todayLog: {},
        streaks: {},
        dailyLogs: [],
      })
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error resetting user data:', err)
      }
      throw err
    }
  },
}))
