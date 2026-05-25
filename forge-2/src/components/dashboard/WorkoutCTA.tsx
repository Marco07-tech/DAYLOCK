import { motion } from 'framer-motion'
import { Play, Clock, Zap } from 'lucide-react'

interface WorkoutCTAProps {
  workoutName: string
  duration: string
  exercises: number
  onStart: () => void
}

export function WorkoutCTA({ workoutName, duration, exercises, onStart }: WorkoutCTAProps) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="relative overflow-hidden bg-[var(--color-primary)] rounded-2xl p-5"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full translate-y-6" />

      <div className="relative z-10">
        <p className="text-xs font-semibold text-black/60 uppercase tracking-widest mb-1">Today's Workout</p>
        <h2 className="text-xl font-bold text-black mb-3">{workoutName}</h2>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-black/60" />
            <span className="text-sm font-medium text-black/80">{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-black/60" />
            <span className="text-sm font-medium text-black/80">{exercises} exercises</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="flex items-center gap-2 bg-black text-[var(--color-primary)] px-5 py-2.5 rounded-xl font-bold text-sm touch-feedback"
        >
          <Play className="w-4 h-4 fill-current" />
          Start Workout
        </button>
      </div>
    </motion.div>
  )
}
