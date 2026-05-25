import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import { Footprints, Flame, MapPin } from 'lucide-react'
import { stepsData } from '@/data/mock-data'

export function Steps() {
  const stepsProgress = (stepsData.today / stepsData.goal) * 100
  const circumference = 2 * Math.PI * 80

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <p className="text-sm text-[var(--color-muted)]">Keep moving</p>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Steps</h1>
      </div>

      <motion.main
        className="px-5 space-y-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      >
        {/* Activity Ring */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-[var(--color-surface)] rounded-2xl p-8 flex flex-col items-center"
        >
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg className="absolute -rotate-90" width="192" height="192">
              <circle cx="96" cy="96" r="80" fill="none" stroke="var(--color-border)" strokeWidth="8" />
              <circle
                cx="96" cy="96" r="80" fill="none"
                stroke="var(--color-primary)" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * stepsProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--color-foreground)]">
                {stepsData.today.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-muted)]">/ {stepsData.goal.toLocaleString()}</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            {Math.round(stepsProgress)}% Complete
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-[var(--color-muted)]">Distance</span>
            </div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">
              {stepsData.distance.toFixed(1)} <span className="text-sm">km</span>
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-[var(--color-muted)]">Calories</span>
            </div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">
              {stepsData.calories} <span className="text-sm">cal</span>
            </p>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-[var(--color-surface)] rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Weekly Steps</h3>
            <span className="text-xs text-[var(--color-muted)]">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={stepsData.weeklySteps} barSize={24} barGap={4}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted)', fontSize: 11, fontWeight: 500 }}
              />
              <Bar dataKey="steps" radius={[6, 6, 6, 6]}>
                {stepsData.weeklySteps.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.steps >= stepsData.goal ? 'var(--color-primary)' : '#3f3f46'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.main>
    </div>
  )
}
