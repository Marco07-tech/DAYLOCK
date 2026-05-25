import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { WorkoutPlanCard } from '@/components/workout/WorkoutPlanCard'
import { workoutPlans } from '@/data/mock-data'

interface WorkoutPlansProps { onSelectWorkout: (id: string) => void }

export function WorkoutPlans({ onSelectWorkout }: WorkoutPlansProps) {
  return (
    <div className="min-h-screen pb-24">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-sm text-[var(--color-muted)]">Ready to train?</p>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Workout Plans</h1>
        </div>
        <button className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center touch-feedback">
          <Plus className="w-5 h-5 text-black" />
        </button>
      </div>

      <motion.div
        className="px-5 space-y-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      >
        {workoutPlans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          >
            <WorkoutPlanCard {...plan} onSelect={onSelectWorkout} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
