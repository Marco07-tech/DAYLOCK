import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getTodayIsoDate } from '../lib/dates'

export type NutritionLog = {
  id?: string
  date: string
  caloriesGoal: number
  breakfastKcal: number
  lunchKcal: number
  dinnerKcal: number
  snacksKcal: number
  proteinGoal: number
  breakfastProtein: number
  lunchProtein: number
  dinnerProtein: number
  snacksProtein: number
  waterGlasses: number
  waterGoal: number
}

type MealSlot = 'breakfast' | 'lunch' | 'dinner'
type MealKcalKey = 'breakfastKcal' | 'lunchKcal' | 'dinnerKcal'
type MealProteinKey = 'breakfastProtein' | 'lunchProtein' | 'dinnerProtein'

const MEAL_KCAL_KEYS: Record<MealSlot, MealKcalKey> = {
  breakfast: 'breakfastKcal',
  lunch: 'lunchKcal',
  dinner: 'dinnerKcal',
}

const MEAL_PROTEIN_KEYS: Record<MealSlot, MealProteinKey> = {
  breakfast: 'breakfastProtein',
  lunch: 'lunchProtein',
  dinner: 'dinnerProtein',
}

interface NutritionState {
  todayLog: NutritionLog | null
  isLoading: boolean
  userId: string | null
  showFirstTimeSetup: boolean
  bodyweight: number | null
  loadTodayNutrition: (userId: string) => Promise<void>
  updateMeal: (meal: MealSlot, kcal: number, protein: number, userId: string) => Promise<void>
  addSnack: (kcal: number, protein: number, userId: string) => Promise<void>
  logGlass: (userId: string) => Promise<void>
  removeGlass: (userId: string) => Promise<void>
  setCalorieGoal: (goal: number) => void
  setProteinGoal: (goal: number) => void
  setWaterGoal: (glasses: number) => void
  saveGoals: (userId: string) => Promise<void>
  dismissFirstTimeSetup: () => void
  getTotalKcal: () => number
  getTotalProtein: () => number
  setBodyweight: (kg: number) => void
  loadBodyweight: (userId: string) => Promise<void>
  saveBodyweight: (userId: string) => Promise<void>
}

function buildDefaultLog(caloriesGoal: number, proteinGoal: number, waterGoal: number): NutritionLog {
  return {
    date: getTodayIsoDate(),
    caloriesGoal,
    breakfastKcal: 0,
    lunchKcal: 0,
    dinnerKcal: 0,
    snacksKcal: 0,
    proteinGoal,
    breakfastProtein: 0,
    lunchProtein: 0,
    dinnerProtein: 0,
    snacksProtein: 0,
    waterGlasses: 0,
    waterGoal,
  }
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  todayLog: null,
  isLoading: false,
  userId: null,
  showFirstTimeSetup: false,
  bodyweight: null,

  loadTodayNutrition: async (userId: string) => {
    try {
      set({ isLoading: true, userId })
      const today = getTodayIsoDate()

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        if (import.meta.env.DEV) {
          console.error('Failed to load nutrition:', error)
        }
        set({ isLoading: false })
        return
      }

      if (data) {
        const log: NutritionLog = {
          id: data.id,
          date: data.date,
          caloriesGoal: data.calories_goal,
          breakfastKcal: data.breakfast_kcal,
          lunchKcal: data.lunch_kcal,
          dinnerKcal: data.dinner_kcal,
          snacksKcal: data.snacks_kcal,
          proteinGoal: data.protein_goal,
          breakfastProtein: data.breakfast_protein,
          lunchProtein: data.lunch_protein,
          dinnerProtein: data.dinner_protein,
          snacksProtein: data.snacks_protein,
          waterGlasses: data.water_glasses,
          waterGoal: data.water_goal,
        }
        set({ todayLog: log, isLoading: false, showFirstTimeSetup: false })
      } else {
        set({ isLoading: false })
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading nutrition:', err)
      }
      set({ isLoading: false })
    }
  },

  updateMeal: async (meal: MealSlot, kcal: number, protein: number, userId: string) => {
    const state = get()
    let log = state.todayLog
    const today = getTodayIsoDate()

    if (!log) {
      log = buildDefaultLog(1800, 120, 8)
    }

    const kcalKey = MEAL_KCAL_KEYS[meal]
    const proteinKey = MEAL_PROTEIN_KEYS[meal]

    const updated = {
      ...log,
      [kcalKey]: kcal,
      [proteinKey]: protein,
    }

    set({ todayLog: updated })

    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        {
          user_id: userId,
          date: today,
          calories_goal: updated.caloriesGoal,
          breakfast_kcal: updated.breakfastKcal,
          lunch_kcal: updated.lunchKcal,
          dinner_kcal: updated.dinnerKcal,
          snacks_kcal: updated.snacksKcal,
          protein_goal: updated.proteinGoal,
          breakfast_protein: updated.breakfastProtein,
          lunch_protein: updated.lunchProtein,
          dinner_protein: updated.dinnerProtein,
          snacks_protein: updated.snacksProtein,
          water_glasses: updated.waterGlasses,
          water_goal: updated.waterGoal,
        },
        { onConflict: 'user_id,date' }
      )

    if (error && import.meta.env.DEV) {
      console.error('Failed to save meal:', error)
    }
  },

  addSnack: async (kcal: number, protein: number, userId: string) => {
    const state = get()
    let log = state.todayLog
    const today = getTodayIsoDate()

    if (!log) {
      log = buildDefaultLog(1800, 120, 8)
    }

    const updated = {
      ...log,
      snacksKcal: log.snacksKcal + kcal,
      snacksProtein: log.snacksProtein + protein,
    }

    set({ todayLog: updated })

    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        {
          user_id: userId,
          date: today,
          calories_goal: updated.caloriesGoal,
          breakfast_kcal: updated.breakfastKcal,
          lunch_kcal: updated.lunchKcal,
          dinner_kcal: updated.dinnerKcal,
          snacks_kcal: updated.snacksKcal,
          protein_goal: updated.proteinGoal,
          breakfast_protein: updated.breakfastProtein,
          lunch_protein: updated.lunchProtein,
          dinner_protein: updated.dinnerProtein,
          snacks_protein: updated.snacksProtein,
          water_glasses: updated.waterGlasses,
          water_goal: updated.waterGoal,
        },
        { onConflict: 'user_id,date' }
      )

    if (error && import.meta.env.DEV) {
      console.error('Failed to save snack:', error)
    }
  },

  logGlass: async (userId: string) => {
    const state = get()
    let log = state.todayLog
    const today = getTodayIsoDate()

    if (!log) {
      log = buildDefaultLog(1800, 120, 8)
    }

    const updated = {
      ...log,
      waterGlasses: Math.min(log.waterGlasses + 1, 20),
    }

    set({ todayLog: updated })

    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        {
          user_id: userId,
          date: today,
          calories_goal: updated.caloriesGoal,
          breakfast_kcal: updated.breakfastKcal,
          lunch_kcal: updated.lunchKcal,
          dinner_kcal: updated.dinnerKcal,
          snacks_kcal: updated.snacksKcal,
          protein_goal: updated.proteinGoal,
          breakfast_protein: updated.breakfastProtein,
          lunch_protein: updated.lunchProtein,
          dinner_protein: updated.dinnerProtein,
          snacks_protein: updated.snacksProtein,
          water_glasses: updated.waterGlasses,
          water_goal: updated.waterGoal,
        },
        { onConflict: 'user_id,date' }
      )

    if (error && import.meta.env.DEV) {
      console.error('Failed to log water:', error)
    }
  },

  removeGlass: async (userId: string) => {
    const state = get()
    const log = state.todayLog
    if (!log) return
    const today = getTodayIsoDate()

    const updated = {
      ...log,
      waterGlasses: Math.max(log.waterGlasses - 1, 0),
    }

    set({ todayLog: updated })

    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        {
          user_id: userId,
          date: today,
          calories_goal: updated.caloriesGoal,
          breakfast_kcal: updated.breakfastKcal,
          lunch_kcal: updated.lunchKcal,
          dinner_kcal: updated.dinnerKcal,
          snacks_kcal: updated.snacksKcal,
          protein_goal: updated.proteinGoal,
          breakfast_protein: updated.breakfastProtein,
          lunch_protein: updated.lunchProtein,
          dinner_protein: updated.dinnerProtein,
          snacks_protein: updated.snacksProtein,
          water_glasses: updated.waterGlasses,
          water_goal: updated.waterGoal,
        },
        { onConflict: 'user_id,date' }
      )

    if (error && import.meta.env.DEV) {
      console.error('Failed to remove water:', error)
    }
  },

  setCalorieGoal: (goal: number) => {
    set((state) => ({
      todayLog: state.todayLog ? { ...state.todayLog, caloriesGoal: goal } : null,
    }))
  },

  setProteinGoal: (goal: number) => {
    set((state) => ({
      todayLog: state.todayLog ? { ...state.todayLog, proteinGoal: goal } : null,
    }))
  },

  setWaterGoal: (glasses: number) => {
    set((state) => ({
      todayLog: state.todayLog ? { ...state.todayLog, waterGoal: glasses } : null,
    }))
  },

  saveGoals: async (userId: string) => {
    const state = get()
    const log = state.todayLog
    if (!log) return
    const today = getTodayIsoDate()

    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        {
          user_id: userId,
          date: today,
          calories_goal: log.caloriesGoal,
          breakfast_kcal: log.breakfastKcal,
          lunch_kcal: log.lunchKcal,
          dinner_kcal: log.dinnerKcal,
          snacks_kcal: log.snacksKcal,
          protein_goal: log.proteinGoal,
          breakfast_protein: log.breakfastProtein,
          lunch_protein: log.lunchProtein,
          dinner_protein: log.dinnerProtein,
          snacks_protein: log.snacksProtein,
          water_glasses: log.waterGlasses,
          water_goal: log.waterGoal,
        },
        { onConflict: 'user_id,date' }
      )

    if (error && import.meta.env.DEV) {
      console.error('Failed to save goals:', error)
    }
  },

  dismissFirstTimeSetup: () => {
    set({ showFirstTimeSetup: false })
  },

  getTotalKcal: () => {
    const log = get().todayLog
    if (!log) return 0
    return log.breakfastKcal + log.lunchKcal + log.dinnerKcal + log.snacksKcal
  },

  getTotalProtein: () => {
    const log = get().todayLog
    if (!log) return 0
    return log.breakfastProtein + log.lunchProtein + log.dinnerProtein + log.snacksProtein
  },

  setBodyweight: (kg: number) => {
    set({ bodyweight: kg })
  },

  loadBodyweight: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('bodyweight')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to load bodyweight:', error)
      }
      return
    }

    if (data?.bodyweight) {
      set({ bodyweight: data.bodyweight })
    }
  },

  saveBodyweight: async (userId: string) => {
    const bodyweight = get().bodyweight
    if (!bodyweight) return

    const { error } = await supabase
      .from('profiles')
      .update({ bodyweight })
      .eq('id', userId)

    if (error && import.meta.env.DEV) {
      console.error('Failed to save bodyweight:', error)
    }
  },
}))
