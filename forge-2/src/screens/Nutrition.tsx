import { motion } from 'framer-motion'
import { Apple, Droplet } from 'lucide-react'
import { nutritionData } from '@/data/mock-data'

export function Nutrition() {
  const consumed = nutritionData.calories.consumed
  const goal = nutritionData.calories.goal
  const calorieProgress = (consumed / goal) * 100

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <p className="text-sm text-[var(--color-muted)]">Track your fuel</p>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Nutrition</h1>
      </div>

      <motion.main
        className="px-5 space-y-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      >
        {/* Calories Card */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-[var(--color-surface)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Calories</h3>
            <span className="text-xs text-[var(--color-muted)]">{consumed} / {goal}</span>
          </div>
          <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(calorieProgress, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Macros */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] px-1">Macronutrients</h3>
          {Object.entries(nutritionData.macros).map(([key, macro]) => {
            const macroProgress = (macro.consumed / macro.goal) * 100
            return (
              <div key={key} className="bg-[var(--color-surface)] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--color-foreground)] capitalize">{key}</span>
                  <span className="text-xs text-[var(--color-muted)]">{macro.consumed}g / {macro.goal}g</span>
                </div>
                <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: macro.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(macroProgress, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Water Tracker */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-[var(--color-surface)] rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Water</span>
            </div>
            <span className="text-xs text-[var(--color-muted)]">{nutritionData.water.consumed}L / {nutritionData.water.goal}L</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <button
                key={i}
                className={`flex-1 py-2 rounded-lg transition-colors touch-feedback ${
                  i < Math.floor(nutritionData.water.consumed) ? 'bg-blue-400/20' : 'bg-[var(--color-surface-2)]'
                }`}
              >
                <Droplet className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Meals */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] px-1">Meals</h3>
          {nutritionData.meals.map((meal) => (
            <div key={meal.id} className="bg-[var(--color-surface)] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[var(--color-foreground)]">{meal.name}</h4>
                  <p className="text-xs text-[var(--color-muted)]">{meal.time}</p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-primary)]">{meal.calories} cal</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {meal.items.map((item, i) => (
                  <span key={i} className="text-[10px] text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.main>
    </div>
  )
}
