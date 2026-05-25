import { motion } from 'framer-motion'
import { Calendar, Zap, Gauge } from 'lucide-react'
import { historyData, personalRecords } from '@/data/mock-data'

export function History() {
  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <p className="text-sm text-[var(--color-muted)]">Your progress</p>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Workout History</h1>
      </div>

      <motion.main
        className="px-5 space-y-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      >
        {/* Recent Workouts */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Recent Workouts</h3>
          {historyData.map((workout) => (
            <div key={workout.id} className="bg-[var(--color-surface)] rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[var(--color-muted)]" />
                    <span className="text-sm font-semibold text-[var(--color-foreground)]">{workout.workoutName}</span>
                    {workout.prs > 0 && (
                      <span className="text-[10px] font-bold bg-red-400/15 text-red-400 px-2 py-0.5 rounded-full">
                        🏆 {workout.prs} PR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">{workout.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--color-border)]">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Duration</p>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">{workout.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Volume</p>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">{workout.volume}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Sets</p>
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">{workout.sets}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Personal Records */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Personal Records</h3>
          {personalRecords.map((pr, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">{pr.exercise}</p>
                <p className="text-xs text-[var(--color-muted)]">{pr.date}</p>
              </div>
              <span className="text-lg font-bold text-[var(--color-primary)] shrink-0">{pr.weight}</span>
            </div>
          ))}
        </motion.div>
      </motion.main>
    </div>
  )
}
