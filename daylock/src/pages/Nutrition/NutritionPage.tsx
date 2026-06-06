import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useNutritionStore } from '../../store/useNutritionStore'
import { BottomNav } from '../../components/layout/BottomNav'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function NutritionPage() {
  const { profile } = useAuthStore()
  const { todayLog, loadToday, updateMeal, addSnack, toggleGlass } = useNutritionStore()
  const [editingMeal, setEditingMeal] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null)
  const [kcalInput, setKcalInput] = useState('')
  const [proteinInput, setProteinInput] = useState('')

  const userId = profile?.id
  const today = new Date()
  const dateStr = DAYS[today.getDay()] + ', ' + today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  useEffect(() => {
    if (!userId || !profile) return
    loadToday(userId, profile.calorie_goal, profile.protein_goal, profile.water_goal)
  }, [userId])

  const totalCalories = todayLog
    ? todayLog.breakfast_kcal + todayLog.lunch_kcal + todayLog.dinner_kcal + todayLog.snacks_kcal
    : 0

  const totalProtein = todayLog
    ? todayLog.breakfast_protein + todayLog.lunch_protein + todayLog.dinner_protein + todayLog.snacks_protein
    : 0

  const calorieGoal = profile?.calorie_goal ?? 1800
  const proteinGoal = profile?.protein_goal ?? 160
  const waterGoal = todayLog?.water_goal ?? 8
  const waterGlasses = todayLog?.water_glasses ?? 0

  const handleMealSave = async (meal: 'breakfast' | 'lunch' | 'dinner') => {
    if (!userId) return
    await updateMeal(userId, meal, Number(kcalInput) || 0, Number(proteinInput) || 0)
    setEditingMeal(null)
    setKcalInput('')
    setProteinInput('')
  }

  const handleSnack = async (kcal: number) => {
    if (!userId) return
    await addSnack(userId, kcal)
  }

  const handleToggleGlass = async (idx: number) => {
    if (!userId) return
    await toggleGlass(userId, idx)
  }

  const MealRow = ({ label, kcal, protein }: { label: string; kcal: number; protein: number }) => (
    <div className="flex items-center justify-between py-2 border-b border-ff-border last:border-0">
      <div className="flex-1">
        <p className="font-body-md text-white">{label}</p>
        <p className="font-label-caps text-label-caps text-ff-muted">{protein}g protein</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-data-mono text-data-mono text-white">{kcal}</span>
        <span className="font-label-caps text-label-caps text-ff-muted">kcal</span>
      </div>
    </div>
  )

  return (
    <div className="bg-background min-h-screen pb-[84px]">
      <div className="page-enter">
        <header className="sticky top-0 bg-background z-40 px-md pt-6 pb-3 border-b border-ff-border">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <p className="font-display text-ff-accent uppercase text-lg tracking-[0.2em]">FORGEFIT</p>
            <div className="text-right">
              <h1 className="font-display text-display-sm text-white">Nutrition</h1>
              <p className="font-body-md text-ff-muted">{dateStr}</p>
            </div>
          </div>
        </header>

        <div className="px-md space-y-4 max-w-lg mx-auto pb-8 pt-4">
          {/* Calories card */}
          <div className="ff-card p-md space-y-sm">
            <div className="flex items-center justify-between">
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">CALORIES</p>
              <p className="text-ff-accent font-display text-headline-sm">{calorieGoal - totalCalories} kcal left</p>
            </div>
            <div className="ff-progress-track">
              <div className="ff-progress-fill" style={{ width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` }} />
            </div>
            <div className="space-y-1">
              <MealRow label="Breakfast" kcal={todayLog?.breakfast_kcal ?? 0} protein={todayLog?.breakfast_protein ?? 0} />
              <MealRow label="Lunch" kcal={todayLog?.lunch_kcal ?? 0} protein={todayLog?.lunch_protein ?? 0} />
              <MealRow label="Dinner" kcal={todayLog?.dinner_kcal ?? 0} protein={todayLog?.dinner_protein ?? 0} />
              <MealRow label="Snacks" kcal={todayLog?.snacks_kcal ?? 0} protein={todayLog?.snacks_protein ?? 0} />
            </div>
            <div className="flex gap-2 pt-2">
              {[150, 300, 500].map((kcal) => (
                <button
                  key={kcal}
                  onClick={() => handleSnack(kcal)}
                  className="border border-ff-border text-ff-muted px-3 py-1.5 rounded-full font-label-caps text-label-caps hover:text-white hover:border-ff-accent transition-colors"
                >
                  +{kcal}
                </button>
              ))}
            </div>
          </div>

          {/* Protein card */}
          <div className="ff-card p-md space-y-sm">
            <div className="flex items-center justify-between">
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">PROTEIN</p>
              <p className="text-white font-display text-headline-sm">
                {totalProtein}g
                <span className="font-body-md text-ff-muted"> consumed</span>
              </p>
            </div>
            <div className="ff-progress-track">
              <div className="ff-progress-fill bg-tertiary-container" style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }} />
            </div>
            <div className="space-y-1">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
                const key = `${meal}_protein` as keyof typeof todayLog
                return (
                  <div key={meal} className="flex items-center justify-between py-2 border-b border-ff-border last:border-0">
                    <p className="font-body-md text-white capitalize">{meal}</p>
                    <span className="font-data-mono text-data-mono text-white">
                      {todayLog ? String(todayLog[key]) : '0'}g
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hydration card */}
          <div className="ff-card p-md space-y-md">
            <div className="flex items-center justify-between">
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">HYDRATION</p>
              <div>
                <span className="text-white font-display text-headline-sm">{waterGlasses} / {waterGoal}</span>
                <span className="font-body-md text-ff-muted ml-1">glasses</span>
              </div>
            </div>
            <p className="font-data-mono text-data-mono text-ff-muted">
              {waterGlasses * 250}ml consumed
            </p>
            <div className="flex justify-between px-xs">
              {Array.from({ length: waterGoal }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleToggleGlass(i)}
                  className="active:scale-90 transition-transform duration-150"
                >
                  <span
                    className="material-symbols-outlined text-[32px] select-none"
                    style={{
                      fontVariationSettings: i < waterGlasses
                        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 32"
                        : "'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 32",
                      color: i < waterGlasses ? '#4F6EF7' : '#2A2A2A'
                    }}
                  >
                    water_drop
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
