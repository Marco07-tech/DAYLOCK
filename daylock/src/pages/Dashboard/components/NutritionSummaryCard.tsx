import { useNavigate } from 'react-router-dom'
import { useNutritionStore } from '../../../store/useNutritionStore'
import { cn } from '../../../lib/utils'

function getBarColor(current: number, goal: number): string {
  if (goal === 0) return 'bg-bg-border'
  const ratio = current / goal
  if (ratio > 1) return 'bg-status-danger'
  if (ratio > 0.9) return 'bg-yellow-400'
  return 'bg-accent-lime'
}

function getKcalColor(current: number, goal: number): string {
  if (goal === 0) return 'text-text-muted'
  const ratio = current / goal
  if (ratio > 1) return 'text-status-danger'
  if (ratio > 0.9) return 'text-yellow-400'
  return 'text-accent-lime'
}

export function NutritionSummaryCard() {
  const navigate = useNavigate()
  const todayLog = useNutritionStore((state) => state.todayLog)
  const getTotalKcal = useNutritionStore((state) => state.getTotalKcal)
  const getTotalProtein = useNutritionStore((state) => state.getTotalProtein)

  if (!todayLog || !todayLog.caloriesGoal) return null

  const totalKcal = getTotalKcal()
  const totalProtein = getTotalProtein()
  const kcalGoal = todayLog.caloriesGoal
  const proteinGoal = todayLog.proteinGoal
  const waterGlasses = todayLog.waterGlasses
  const waterGoal = todayLog.waterGoal

  return (
    <button
      onClick={() => navigate('/gym?s=nutrition')}
      className="w-full bg-bg-card border border-bg-border rounded-2xl p-4 text-left hover:border-accent-lime transition-colors"
    >
      <div className="grid grid-cols-3 gap-3">
        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">🔥</span>
            <span className={cn('text-xs font-semibold', getKcalColor(totalKcal, kcalGoal))}>
              {totalKcal}
            </span>
          </div>
          <div className="h-1 bg-bg-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', getBarColor(totalKcal, kcalGoal))}
              style={{ width: `${Math.min((totalKcal / kcalGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-text-muted text-[10px] mt-1">/ {kcalGoal}</p>
        </div>

        {/* Protein */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">💪</span>
            <span className={cn('text-xs font-semibold', getKcalColor(totalProtein, proteinGoal))}>
              {totalProtein}g
            </span>
          </div>
          <div className="h-1 bg-bg-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', getBarColor(totalProtein, proteinGoal))}
              style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-text-muted text-[10px] mt-1">/ {proteinGoal}g</p>
        </div>

        {/* Water */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">💧</span>
            <span className="text-xs font-semibold text-blue-400">{waterGlasses}</span>
          </div>
          <div className="h-1 bg-bg-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', getBarColor(waterGlasses, waterGoal))}
              style={{ width: `${Math.min((waterGlasses / waterGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-text-muted text-[10px] mt-1">/ {waterGoal}</p>
        </div>
      </div>
    </button>
  )
}
