import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface WorkoutSet {
  id: string
  exercise_name: string
  muscle_group: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  done: boolean
}

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration_minutes: number | null
  completed: boolean
  sets: WorkoutSet[]
}

interface SplitDay {
  day_of_week: number
  workout_name: string
  is_rest: boolean
}

interface WorkoutState {
  activeSession: WorkoutSession | null
  sessions: WorkoutSession[]
  split: SplitDay[]
  isLoading: boolean
  timerStart: number | null

  loadTodaySession: (userId: string) => Promise<void>
  loadSplit: (userId: string) => Promise<void>
  loadRecentSessions: (userId: string) => Promise<void>
  startWorkout: (userId: string, name: string) => Promise<void>
  addExercise: (userId: string, exerciseName: string, muscleGroup: string) => Promise<void>
  addSet: (setData: Omit<WorkoutSet, 'id'> & { session_id: string; user_id: string }) => Promise<void>
  updateSet: (setId: string, updates: Partial<WorkoutSet>) => Promise<void>
  toggleSetDone: (setId: string) => void
  finishWorkout: (sessionId: string, durationMinutes: number) => Promise<void>
  saveSplit: (userId: string, split: SplitDay[]) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  activeSession: null,
  sessions: [],
  split: [],
  isLoading: false,
  timerStart: null,

  loadTodaySession: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('workout_sessions')
        .select('*, workout_sets(*)')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('completed', false)
        .single()

      if (data) {
        const session = data as unknown as WorkoutSession & { workout_sets: WorkoutSet[] }
        set({
          activeSession: { ...session, sets: session.workout_sets ?? [] },
          timerStart: Date.now()
        })
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  loadSplit: async (userId) => {
    try {
      const { data } = await supabase
        .from('weekly_split')
        .select('day_of_week, workout_name, is_rest')
        .eq('user_id', userId)
        .order('day_of_week')
      if (data) set({ split: data as SplitDay[] })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  loadRecentSessions: async (userId) => {
    try {
      const { data } = await supabase
        .from('workout_sessions')
        .select('*, workout_sets(*)')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) {
        set({ sessions: data.map((s) => {
          const session = s as unknown as WorkoutSession & { workout_sets: WorkoutSet[] }
          return { ...session, sets: session.workout_sets ?? [] }
        }) })
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  startWorkout: async (userId, name) => {
    try {
      const { data } = await supabase
        .from('workout_sessions')
        .insert({ user_id: userId, name, date: new Date().toISOString().split('T')[0] })
        .select()
        .single()
      if (data) set({ activeSession: { ...data as unknown as WorkoutSession, sets: [] }, timerStart: Date.now() })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  addExercise: async (userId, exerciseName, muscleGroup) => {
    try {
      const { activeSession } = get()
      if (!activeSession) return
      const existingSets = activeSession.sets.filter(s => s.exercise_name === exerciseName)
      const setNumber = existingSets.length + 1
      const { data } = await supabase
        .from('workout_sets')
        .insert({
          session_id: activeSession.id,
          user_id: userId,
          exercise_name: exerciseName,
          muscle_group: muscleGroup,
          set_number: setNumber,
          done: false
        })
        .select()
        .single()
      if (data) {
        set(state => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, sets: [...state.activeSession.sets, data as unknown as WorkoutSet] }
            : null
        }))
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  addSet: async (setData) => {
    try {
      const { data } = await supabase.from('workout_sets').insert(setData).select().single()
      if (data) {
        set(state => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, sets: [...state.activeSession.sets, data as unknown as WorkoutSet] }
            : null
        }))
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  updateSet: async (setId, updates) => {
    try {
      await supabase.from('workout_sets').update(updates).eq('id', setId)
      set(state => ({
        activeSession: state.activeSession ? {
          ...state.activeSession,
          sets: state.activeSession.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        } : null
      }))
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  toggleSetDone: (setId) => {
    const { activeSession } = get()
    if (!activeSession) return
    const s = activeSession.sets.find(s => s.id === setId)
    if (!s) return
    const newDone = !s.done
    supabase.from('workout_sets').update({ done: newDone }).eq('id', setId).then()
    set(state => ({
      activeSession: state.activeSession ? {
        ...state.activeSession,
        sets: state.activeSession.sets.map(s => s.id === setId ? { ...s, done: newDone } : s)
      } : null
    }))
  },

  finishWorkout: async (sessionId, durationMinutes) => {
    try {
      await supabase.from('workout_sessions').update({ completed: true, duration_minutes: durationMinutes }).eq('id', sessionId)
      set(state => ({
        activeSession: null,
        sessions: state.activeSession
          ? [{ ...state.activeSession, completed: true, duration_minutes: durationMinutes }, ...state.sessions]
          : state.sessions
      }))
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  saveSplit: async (userId, split) => {
    try {
      for (const day of split) {
        await supabase.from('weekly_split').upsert(
          { user_id: userId, ...day },
          { onConflict: 'user_id,day_of_week' }
        )
      }
      set({ split })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },
}))
