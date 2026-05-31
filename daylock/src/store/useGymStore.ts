import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { WorkoutLog, GymSplit, WeeklySplit, Exercise, Set } from '../types/index'
import { getDayName, formatDate } from '../lib/utils'

const DEFAULT_EXERCISES_BY_SPLIT: Record<GymSplit, Omit<Exercise, 'id' | 'sets'>[]> = {
  Push: [
    { name: 'Bench Press', muscleGroup: 'Chest' },
    { name: 'Overhead Press', muscleGroup: 'Shoulders' },
    { name: 'Tricep Pushdown', muscleGroup: 'Triceps' },
    { name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  ],
  Pull: [
    { name: 'Deadlift', muscleGroup: 'Back' },
    { name: 'Pull-ups', muscleGroup: 'Back' },
    { name: 'Barbell Row', muscleGroup: 'Back' },
    { name: 'Bicep Curls', muscleGroup: 'Arms' },
  ],
  Legs: [
    { name: 'Squats', muscleGroup: 'Quads' },
    { name: 'Leg Press', muscleGroup: 'Quads' },
    { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings' },
    { name: 'Calf Raises', muscleGroup: 'Calves' },
  ],
  'Full Body': [
    { name: 'Squats', muscleGroup: 'Quads' },
    { name: 'Bench Press', muscleGroup: 'Chest' },
    { name: 'Barbell Row', muscleGroup: 'Back' },
    { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  ],
  Rest: [],
}

const DEFAULT_WEEKLY_SPLIT: WeeklySplit = {
  Sunday: 'Rest',
  Monday: 'Push',
  Tuesday: 'Pull',
  Wednesday: 'Legs',
  Thursday: 'Rest',
  Friday: 'Push',
  Saturday: 'Pull',
}

interface GymState {
  weeklySplit: WeeklySplit
  todayWorkout: WorkoutLog | null
  workoutHistory: WorkoutLog[]
  isLoading: boolean
  userId: string | null
  loadGymSplit: (userId: string) => Promise<void>
  updateWeeklySplit: (day: string, split: GymSplit, userId: string) => Promise<void>
  loadTodayWorkout: (userId: string) => Promise<void>
  initTodayWorkout: (userId: string) => Promise<void>
  updateSet: (exerciseId: string, setId: string, data: Partial<Set>) => void
  addSet: (exerciseId: string) => void
  addExercise: (name: string, muscleGroup: string) => void
  completeWorkout: (userId: string) => Promise<void>
  getTodaySplit: () => GymSplit
  isWorkoutComplete: () => boolean
  _saveWorkoutDebounced: () => Promise<void>
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export const useGymStore = create<GymState>((set, get) => ({
  weeklySplit: DEFAULT_WEEKLY_SPLIT,
  todayWorkout: null as WorkoutLog | null,
  workoutHistory: [] as WorkoutLog[],
  isLoading: false,
  userId: null,

  loadGymSplit: async (userId: string) => {
    try {
      set({ isLoading: true, userId })
      const { data, error } = await supabase
        .from('gym_splits')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to load gym split:', error)
        // Use defaults if load fails
        set({ isLoading: false })
        return
      }

      if (data && data.length > 0) {
        // Map DB records to WeeklySplit object
        const split: WeeklySplit = { ...DEFAULT_WEEKLY_SPLIT }
        data.forEach((record: any) => {
          split[record.day_name as keyof WeeklySplit] = record.split_name as GymSplit
        })
        set({ weeklySplit: split, isLoading: false })
      } else {
        // Save defaults to DB if first time
        for (const [day, splitName] of Object.entries(DEFAULT_WEEKLY_SPLIT)) {
          await supabase.from('gym_splits').upsert(
            {
              user_id: userId,
              day_name: day,
              split_name: splitName,
            },
            { onConflict: 'user_id,day_name' }
          )
        }
        set({ weeklySplit: DEFAULT_WEEKLY_SPLIT, isLoading: false })
      }
    } catch (err) {
      console.error('Error loading gym split:', err)
      set({ isLoading: false })
    }
  },

  updateWeeklySplit: async (day: string, split: GymSplit, userId: string) => {
    try {
      // Update local state immediately
      set((state) => ({
        weeklySplit: {
          ...state.weeklySplit,
          [day]: split,
        },
      }))

      // Sync to database
      await supabase.from('gym_splits').upsert(
        {
          user_id: userId,
          day_name: day,
          split_name: split,
        },
        { onConflict: 'user_id,day_name' }
      )
    } catch (err) {
      console.error('Error updating gym split:', err)
    }
  },

  loadTodayWorkout: async (userId: string) => {
    try {
      set({ isLoading: true })
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, which is expected
        console.error('Failed to load today workout:', error)
        set({ isLoading: false })
        return
      }

      if (data) {
        const workout: WorkoutLog = {
          id: data.id,
          date: data.date,
          splitName: data.split_name,
          exercises: data.exercises,
          completed: data.completed,
          createdAt: data.created_at,
        }
        set({ todayWorkout: workout, isLoading: false })
      } else {
        // No workout for today, create one
        await get().initTodayWorkout(userId)
      }
    } catch (err) {
      console.error('Error loading today workout:', err)
      set({ isLoading: false })
    }
  },

  initTodayWorkout: async (userId: string) => {
    try {
      const state = get()
      const today = getDayName()
      const dayKey = today as keyof WeeklySplit
      const splitName = state.weeklySplit[dayKey] || 'Rest'

      let exercises: Exercise[] = []
      if (splitName !== 'Rest') {
        const defaultExercises = DEFAULT_EXERCISES_BY_SPLIT[splitName as GymSplit] || []
        exercises = defaultExercises.map((ex: any) => ({
          id: crypto.randomUUID(),
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: [
            { id: crypto.randomUUID(), weight: 0, reps: 0, done: false },
            { id: crypto.randomUUID(), weight: 0, reps: 0, done: false },
            { id: crypto.randomUUID(), weight: 0, reps: 0, done: false },
          ],
        }))
      }

      const isoDate = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('workout_logs')
        .upsert({
          user_id: userId,
          date: isoDate,
          split_name: splitName,
          exercises,
          completed: false,
        }, { onConflict: 'user_id,date' })
        .select()
        .single()

      if (error) {
        console.error('Failed to create workout:', error)
        // Fall back to local-only state
        set({
          todayWorkout: {
            date: formatDate(),
            splitName,
            exercises,
            completed: false,
          },
        })
        return
      }

      if (data) {
        const workout: WorkoutLog = {
          id: data.id,
          date: data.date,
          splitName: data.split_name,
          exercises: data.exercises,
          completed: data.completed,
          createdAt: data.created_at,
        }
        set({ todayWorkout: workout })
      }
    } catch (err) {
      console.error('Error initializing today workout:', err)
    }
  },

  updateSet: (exerciseId: string, setId: string, data: Partial<Set>) => {
    set((state) => {
      if (!state.todayWorkout) return state

      return {
        todayWorkout: {
          ...state.todayWorkout,
          exercises: state.todayWorkout.exercises.map((ex) =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...data } : s)),
                }
              : ex
          ),
        },
      }
    })

    // Debounce DB save
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      get()._saveWorkoutDebounced()
    }, 1000)
  },

  addSet: (exerciseId: string) => {
    set((state) => {
      if (!state.todayWorkout) return state

      return {
        todayWorkout: {
          ...state.todayWorkout,
          exercises: state.todayWorkout.exercises.map((ex) =>
            ex.id === exerciseId
              ? {
                  ...ex,
                  sets: [
                    ...ex.sets,
                    {
                      id: crypto.randomUUID(),
                      weight: 0,
                      reps: 0,
                      done: false,
                    },
                  ],
                }
              : ex
          ),
        },
      }
    })

    // Debounce DB save
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      get()._saveWorkoutDebounced()
    }, 1000)
  },

  addExercise: (name: string, muscleGroup: string) => {
    set((state) => {
      if (!state.todayWorkout) return state

      const newExercise: Exercise = {
        id: crypto.randomUUID(),
        name,
        muscleGroup,
        sets: [
          { id: crypto.randomUUID(), weight: 0, reps: 0, done: false },
          { id: crypto.randomUUID(), weight: 0, reps: 0, done: false },
          { id: crypto.randomUUID(), weight: 0, reps: 0, done: false },
        ],
      }

      return {
        todayWorkout: {
          ...state.todayWorkout,
          exercises: [...state.todayWorkout.exercises, newExercise],
        },
      }
    })

    // Debounce DB save
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      get()._saveWorkoutDebounced()
    }, 1000)
  },

  completeWorkout: async (userId: string) => {
    try {
      const state = get()
      if (!state.todayWorkout) return

      // Update local state
      set((s) => ({
        todayWorkout: s.todayWorkout
          ? {
              ...s.todayWorkout,
              completed: true,
            }
          : null,
      }))

      // Sync to database
      const { error } = await supabase
        .from('workout_logs')
        .update({ completed: true })
        .eq('id', state.todayWorkout?.id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to complete workout:', error)
      }
    } catch (err) {
      console.error('Error completing workout:', err)
    }
  },

  getTodaySplit: () => {
    const state = get()
    const today = getDayName()
    const dayKey = today as keyof WeeklySplit
    return state.weeklySplit[dayKey] || 'Rest'
  },

  isWorkoutComplete: () => {
    const state = get()
    if (!state.todayWorkout || state.todayWorkout.exercises.length === 0) {
      return false
    }

    return state.todayWorkout.exercises.every((exercise: Exercise) =>
      exercise.sets.every((set: Set) => set.done)
    )
  },

  _saveWorkoutDebounced: async () => {
    try {
      const state = get()
      if (!state.todayWorkout) return

      const { error } = await supabase
        .from('workout_logs')
        .update({ exercises: state.todayWorkout.exercises })
        .eq('id', state.todayWorkout.id)

      if (error) {
        console.error('Failed to save workout:', error)
      }
    } catch (err) {
      console.error('Error saving workout:', err)
    }
  },
}))
