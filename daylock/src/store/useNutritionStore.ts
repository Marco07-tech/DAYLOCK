import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface NutritionLog {
  id?: string
  date: string
  calorie_goal: number
  breakfast_kcal: number
  lunch_kcal: number
  dinner_kcal: number
  snacks_kcal: number
  protein_goal: number
  breakfast_protein: number
  lunch_protein: number
  dinner_protein: number
  snacks_protein: number
  water_glasses: number
  water_goal: number
}

interface NutritionState {
  todayLog: NutritionLog | null
  isLoading: boolean
  loadToday: (userId: string, calorieGoal: number, proteinGoal: number, waterGoal: number) => Promise<void>
  updateMeal: (userId: string, meal: 'breakfast' | 'lunch' | 'dinner', kcal: number, protein: number) => Promise<void>
  addSnack: (userId: string, kcal: number) => Promise<void>
  toggleGlass: (userId: string, glassIndex: number) => Promise<void>
}

const defaultLog = (calorieGoal: number, proteinGoal: number, waterGoal: number): NutritionLog => ({
  date: new Date().toISOString().split('T')[0],
  calorie_goal: calorieGoal,
  breakfast_kcal: 0, lunch_kcal: 0, dinner_kcal: 0, snacks_kcal: 0,
  protein_goal: proteinGoal,
  breakfast_protein: 0, lunch_protein: 0, dinner_protein: 0, snacks_protein: 0,
  water_glasses: 0, water_goal: waterGoal,
})

export const useNutritionStore = create<NutritionState>((set, get) => ({
  todayLog: null,
  isLoading: false,

  loadToday: async (userId, calorieGoal, proteinGoal, waterGoal) => {
    try {
      set({ isLoading: true })
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()
      set({ todayLog: data ?? defaultLog(calorieGoal, proteinGoal, waterGoal), isLoading: false })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
      set({ isLoading: false, todayLog: defaultLog(calorieGoal, proteinGoal, waterGoal) })
    }
  },

  updateMeal: async (userId, meal, kcal, protein) => {
    const { todayLog } = get()
    if (!todayLog) return
    const updates = { [`${meal}_kcal`]: kcal, [`${meal}_protein`]: protein }
    const newLog = { ...todayLog, ...updates }
    set({ todayLog: newLog })
    try {
      await supabase.from('nutrition_logs').upsert({ user_id: userId, ...newLog }, { onConflict: 'user_id,date' })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  addSnack: async (userId, kcal) => {
    const { todayLog } = get()
    if (!todayLog) return
    const newLog = { ...todayLog, snacks_kcal: todayLog.snacks_kcal + kcal }
    set({ todayLog: newLog })
    try {
      await supabase.from('nutrition_logs').upsert({ user_id: userId, ...newLog }, { onConflict: 'user_id,date' })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },

  toggleGlass: async (userId, glassIndex) => {
    const { todayLog } = get()
    if (!todayLog) return
    const newGlasses = glassIndex < todayLog.water_glasses
      ? todayLog.water_glasses - 1
      : todayLog.water_glasses + 1
    const newLog = { ...todayLog, water_glasses: Math.max(0, Math.min(newGlasses, todayLog.water_goal)) }
    set({ todayLog: newLog })
    try {
      await supabase.from('nutrition_logs').upsert({ user_id: userId, ...newLog }, { onConflict: 'user_id,date' })
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    }
  },
}))
