import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Task } from '../types/index'
import { getDayName } from '../lib/utils'

interface TaskState {
  tasks: Task[]
  todayLog: { [taskId: string]: boolean }
  streaks: { [taskId: string]: number }
  isLoading: boolean
  userId: string | null
  loadTasks: (userId: string) => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'streak' | 'done'>, userId: string) => Promise<void>
  removeTask: (id: string, userId: string) => Promise<void>
  toggleTaskDone: (id: string, userId: string) => Promise<void>
  getTodayTasks: () => Task[]
  getCompletionPercent: () => number
  getBestStreak: () => number
  saveDailyLog: (userId: string) => Promise<void>
  resetTodayTasks: (userId: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [] as Task[],
  todayLog: {} as { [taskId: string]: boolean },
  streaks: {} as { [taskId: string]: number },
  isLoading: false,
  userId: null,

  loadTasks: async (userId: string) => {
    try {
      set({ isLoading: true, userId })
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at')

      if (error) {
        console.error('Failed to load tasks:', error)
        set({ isLoading: false })
        return
      }

      if (data) {
        // Map snake_case from DB to camelCase for frontend
        const tasks: Task[] = data.map((t: any) => ({
          id: t.id,
          type: t.type,
          name: t.name,
          icon: t.icon,
          meta: t.meta,
          streak: t.streak,
          done: t.done,
          scheduledDays: t.scheduled_days,
          scheduledTime: t.scheduled_time,
          createdAt: t.created_at,
        }))

        const streaks: { [key: string]: number } = {}
        tasks.forEach((task) => {
          streaks[task.id] = task.streak
        })

        set({ tasks, streaks, isLoading: false })
      }
    } catch (err) {
      console.error('Error loading tasks:', err)
      set({ isLoading: false })
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
        console.error('Failed to add task:', error)
        return
      }

      if (data) {
        // Optimistically update local state
        const newTask: Task = {
          id: data.id,
          type: data.type,
          name: data.name,
          icon: data.icon,
          meta: data.meta,
          streak: data.streak,
          done: data.done,
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
      console.error('Error adding task:', err)
    }
  },

  toggleTaskDone: async (id: string, userId: string) => {
    try {
      const state = get()
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return

      const isDone = state.todayLog[id] || false
      const newDone = !isDone
      const currentStreak = state.streaks[id] || 0
      const newStreak = newDone ? currentStreak + 1 : Math.max(0, currentStreak - 1)

      // Optimistically update local state
      set((s) => ({
        todayLog: {
          ...s.todayLog,
          [id]: newDone,
        },
        streaks: {
          ...s.streaks,
          [id]: newStreak,
        },
        tasks: s.tasks.map((t) =>
          t.id === id ? { ...t, streak: newStreak, done: newDone } : t
        ),
      }))

      // Sync to database
      const { error } = await supabase
        .from('tasks')
        .update({
          done: newDone,
          streak: newStreak,
        })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to toggle task:', error)
      }

      // Save daily log after toggle
      await get().saveDailyLog(userId)
    } catch (err) {
      console.error('Error toggling task:', err)
    }
  },

  removeTask: async (id: string, userId: string) => {
    try {
      // Optimistically remove from local state
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

      // Sync to database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to remove task:', error)
      }
    } catch (err) {
      console.error('Error removing task:', err)
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
      const today = new Date().toISOString().split('T')[0]

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
      console.error('Error saving daily log:', err)
    }
  },

  resetTodayTasks: async (userId: string) => {
    try {
      // Reset local state
      set({
        todayLog: {},
      })

      // Reset in database
      const { error } = await supabase
        .from('tasks')
        .update({ done: false })
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to reset today tasks:', error)
      }
    } catch (err) {
      console.error('Error resetting today tasks:', err)
    }
  },
}))
