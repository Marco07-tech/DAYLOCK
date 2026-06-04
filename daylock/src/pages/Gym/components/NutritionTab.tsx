import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useNutritionStore } from '../../../store/useNutritionStore'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../lib/utils'

type MealSlot = 'breakfast' | 'lunch' | 'dinner'
type SetupStep = 'weight' | 'goal' | 'done'

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

const MEAL_ICONS: Record<MealSlot, string> = {
  breakfast: 'wb_sunny',
  lunch: 'light_mode',
  dinner: 'nightlight',
}

const PRESET_OPTIONS = [
  { label: 'Light', kcal: 350, protein: 20 },
  { label: 'Normal', kcal: 650, protein: 35 },
  { label: 'Heavy', kcal: 950, protein: 50 },
  { label: 'Custom', kcal: null, protein: null },
]

const SNACK_OPTIONS = [
  { label: '+150', kcal: 150, protein: 5 },
  { label: '+300', kcal: 300, protein: 10 },
  { label: '+500', kcal: 500, protein: 15 },
]

function getKcalColor(current: number, goal: number): string {
  if (goal === 0) return 'text-on-surface-variant'
  const ratio = current / goal
  if (ratio > 1) return 'text-error'
  if (ratio > 0.9) return 'text-status-warning'
  return 'text-primary'
}

function getBarColor(current: number, goal: number): string {
  if (goal === 0) return 'bg-outline-variant'
  const ratio = current / goal
  if (ratio > 1) return 'bg-error'
  if (ratio > 0.9) return 'bg-status-warning'
  return 'bg-primary'
}

export function NutritionTab() {
  const user = useAuthStore((state) => state.user)
  const todayLog = useNutritionStore((state) => state.todayLog)
  const isLoading = useNutritionStore((state) => state.isLoading)
  const bodyweight = useNutritionStore((state) => state.bodyweight)

  const loadTodayNutrition = useNutritionStore((state) => state.loadTodayNutrition)
  const updateMeal = useNutritionStore((state) => state.updateMeal)
  const addSnack = useNutritionStore((state) => state.addSnack)
  const logGlass = useNutritionStore((state) => state.logGlass)
  const removeGlass = useNutritionStore((state) => state.removeGlass)
  const setCalorieGoal = useNutritionStore((state) => state.setCalorieGoal)
  const setProteinGoal = useNutritionStore((state) => state.setProteinGoal)
  const saveGoals = useNutritionStore((state) => state.saveGoals)
  const setBodyweight = useNutritionStore((state) => state.setBodyweight)
  const saveBodyweight = useNutritionStore((state) => state.saveBodyweight)
  const getTotalKcal = useNutritionStore((state) => state.getTotalKcal)
  const getTotalProtein = useNutritionStore((state) => state.getTotalProtein)

  const [selectedMeal, setSelectedMeal] = useState<MealSlot | null>(null)
  const [customKcal, setCustomKcal] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [setupStep, setSetupStep] = useState<SetupStep>('weight')
  const [setupWeight, setSetupWeight] = useState('')
  const [setupGoal, setSetupGoal] = useState<'cut' | 'maintain' | 'bulk' | null>(null)
  const [saving, setSaving] = useState(false)
  const bottomSheetRef = useRef<HTMLDivElement>(null)
  const customKcalRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      loadTodayNutrition(user.id)
    }
  }, [user, loadTodayNutrition])

  useEffect(() => {
    if (bodyweight && !setupWeight) {
      setSetupWeight(String(bodyweight))
    }
  }, [bodyweight, setupWeight])

  // Show first-time setup if no goals exist
  useEffect(() => {
    if (!isLoading && user && !todayLog) {
      setSetupStep('weight')
      setSetupGoal(null)
    }
  }, [isLoading, user, todayLog])

  const totalKcal = getTotalKcal()
  const totalProtein = getTotalProtein()
  const kcalGoal = todayLog?.caloriesGoal ?? 1800
  const proteinGoal = todayLog?.proteinGoal ?? 120
  const waterGlasses = todayLog?.waterGlasses ?? 0
  const waterGoal = todayLog?.waterGoal ?? 8
  const hasGoals = kcalGoal > 0

  const handlePresetSelect = (option: typeof PRESET_OPTIONS[number]) => {
    if (!selectedMeal || !user) return

    if (option.label === 'Custom') {
      customKcalRef.current?.focus()
      return
    }

    updateMeal(selectedMeal, option.kcal!, option.protein!, user.id)
    setSelectedMeal(null)
    setCustomKcal('')
    setCustomProtein('')
  }

  const handleCustomSave = () => {
    if (!selectedMeal || !user) return
    const kcal = parseInt(customKcal, 10)
    const protein = parseInt(customProtein, 10)
    if (isNaN(kcal) || isNaN(protein)) return

    updateMeal(selectedMeal, kcal, protein, user.id)
    setSelectedMeal(null)
    setCustomKcal('')
    setCustomProtein('')
  }

  const handleFinishSetup = async () => {
    if (!user) return
    setSaving(true)

    const kg = parseInt(setupWeight, 10)
    if (!isNaN(kg) && kg > 0) {
      setBodyweight(kg)
      await saveBodyweight(user.id)
    }

    let suggestedCalories = 1800
    let suggestedProtein = 120

    if (!isNaN(kg) && kg > 0) {
      suggestedCalories = kg * 30
      if (setupGoal === 'cut') suggestedCalories -= 400
      if (setupGoal === 'bulk') suggestedCalories += 300
      suggestedProtein = Math.round(kg * 1.6)
    }

    setCalorieGoal(suggestedCalories)
    setProteinGoal(suggestedProtein)
    await saveGoals(user.id)
    setSaving(false)
    loadTodayNutrition(user.id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
         <div className="w-8 h-8 rounded-full border-2 border-outline-variant border-t-primary animate-spin" />
      </div>
    )
  }

  // First-time setup
  if (!hasGoals) {
    return (
      <div className="px-container-padding py-6 space-y-6">
        <div className="text-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Set Up Nutrition</h2>
          <p className="text-on-surface-variant text-sm mt-1">Let's calculate your daily goals</p>
        </div>

        {setupStep === 'weight' && (
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4">
            <label className="block text-sm font-medium text-on-surface">
              Your weight (kg)
            </label>
            <input
              type="number"
              value={setupWeight}
              onChange={(e) => setSetupWeight(e.target.value)}
              placeholder="e.g. 75"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-lg focus:outline-none focus:border-primary transition-colors"
            />
            <Button
              variant="primary"
              className="w-full"
              disabled={!setupWeight || parseInt(setupWeight, 10) <= 0}
              onClick={() => setSetupStep('goal')}
            >
              Next →
            </Button>
          </div>
        )}

        {setupStep === 'goal' && (
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4">
            <label className="block text-sm font-medium text-on-surface">
              Your goal
            </label>
            <div className="flex gap-2">
              {(['cut', 'maintain', 'bulk'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSetupGoal(g)}
                  className={cn(
                    'flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                    setupGoal === g
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary'
                  )}
                >
                  {g === 'cut' ? 'Cut' : g === 'maintain' ? 'Maintain' : 'Bulk'}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              className="w-full"
              isLoading={saving}
              disabled={!setupGoal}
              onClick={handleFinishSetup}
            >
              Set my goals
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-container-padding pb-6 space-y-5">
      {/* Calorie Progress Card */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-on-surface text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-primary mr-1">local_fire_department</span> Calories</p>
          <p className={cn('text-xs font-semibold', getKcalColor(totalKcal, kcalGoal))}>
            {totalKcal.toLocaleString()} / {kcalGoal.toLocaleString()} kcal
          </p>
        </div>
        <div className="h-2 bg-outline-variant rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', getBarColor(totalKcal, kcalGoal))}
            style={{ width: `${Math.min((totalKcal / kcalGoal) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Protein Progress Card */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-on-surface text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-primary mr-1">fitness_center</span> Protein</p>
          <p className={cn('text-xs font-semibold', getKcalColor(totalProtein, proteinGoal))}>
            {totalProtein}g / {proteinGoal}g
          </p>
        </div>
        <div className="h-2 bg-outline-variant rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', getBarColor(totalProtein, proteinGoal))}
            style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Meal Slots */}
      <div className="space-y-2">
        <p className="text-on-surface text-sm font-medium">Meals</p>
        {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((meal) => {
          const kcalKey = meal === 'breakfast' ? 'breakfastKcal' : meal === 'lunch' ? 'lunchKcal' : 'dinnerKcal'
          const proteinKey = meal === 'breakfast' ? 'breakfastProtein' : meal === 'lunch' ? 'lunchProtein' : 'dinnerProtein'
          const kcal = todayLog?.[kcalKey] ?? 0
          const protein = todayLog?.[proteinKey] ?? 0

          return (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-left hover:border-primary transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-primary">{MEAL_ICONS[meal]}</span>
                <div>
                  <p className="text-on-surface text-sm font-medium">{MEAL_LABELS[meal]}</p>
                  {kcal > 0 && (
                    <p className="text-on-surface-variant text-xs">{kcal} kcal · {protein}g protein</p>
                  )}
                </div>
              </div>
              {kcal > 0 ? (
                <span className="text-primary text-xs font-semibold">{kcal} kcal</span>
              ) : (
                <span className="text-on-surface-variant text-xs">Tap to add</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Snack Quick Add */}
      <div>
        <p className="text-on-surface text-sm font-medium mb-2">Snacks</p>
        <div className="flex gap-2">
          {SNACK_OPTIONS.map((opt) => (
            <button
              key={opt.kcal}
              onClick={() => {
                if (user) addSnack(opt.kcal, opt.protein, user.id)
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface text-xs font-medium hover:border-primary transition-colors"
            >
              {opt.label} kcal
            </button>
          ))}
        </div>
      </div>

      {/* Water Tracker */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-on-surface text-sm font-medium"><span className="material-symbols-outlined text-[16px] text-primary mr-1">water_drop</span> Water</p>
          <p className="text-on-surface-variant text-xs">{waterGlasses * 250}ml / {waterGoal * 250}ml</p>
        </div>
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: waterGoal }, (_, i) => {
            const filled = i < waterGlasses
            return (
              <button
                key={i}
                onClick={() => {
                  if (!user) return
                  if (filled) {
                    removeGlass(user.id)
                  } else {
                    logGlass(user.id)
                  }
                }}
                className={cn(
                  'w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all duration-150',
                  filled
                    ? 'bg-blue-500 text-white'
                    : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                )}
              >
                <span className="material-symbols-outlined text-[16px]">{filled ? 'water_drop' : 'water_drop'}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Meal Bottom Sheet */}
      {selectedMeal && (
        <>
          <div
            className="fixed inset-0 bg-[rgba(26,26,26,0.4)] backdrop-blur-[4px] z-40"
            onClick={() => setSelectedMeal(null)}
          />
          <div
            ref={bottomSheetRef}
            className="fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant rounded-t-3xl z-50 p-4 space-y-3"
          >
            <div className="flex justify-center pb-2">
              <div className="w-9 h-1 bg-outline-variant rounded-full" />
            </div>
            <h3 className="text-on-surface font-semibold text-base text-center">
              <span className="material-symbols-outlined text-[20px] text-primary">{MEAL_ICONS[selectedMeal]}</span> {MEAL_LABELS[selectedMeal]}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handlePresetSelect(opt)}
                  className={cn(
                    'px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                    opt.label === 'Custom'
                      ? 'bg-surface-container-low border border-dashed border-outline-variant text-on-surface-variant'
                      : 'bg-surface-container-low border border-outline-variant text-on-surface hover:border-primary'
                  )}
                >
                  {opt.label === 'Custom' ? (
                    <><span className="material-symbols-outlined text-[16px]">edit</span> Custom</>
                  ) : (
                    <>
                      <div>{opt.label}</div>
                      <div className="text-on-surface-variant text-xs mt-0.5">{opt.kcal} kcal · {opt.protein}g</div>
                    </>
                  )}
                </button>
              ))}
            </div>

            {PRESET_OPTIONS.find((o) => o.label === 'Custom') && (
              <div className="space-y-2 pt-2 border-t border-outline-variant">
                <div className="flex gap-2">
                  <input
                    ref={customKcalRef}
                    type="number"
                    value={customKcal}
                    onChange={(e) => setCustomKcal(e.target.value)}
                    placeholder="Calories"
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="Protein (g)"
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!customKcal || !customProtein}
                  onClick={handleCustomSave}
                >
                  Save
                </Button>
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setSelectedMeal(null)}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
