import { motion } from 'framer-motion'
import { Clock, Dumbbell, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface WorkoutPlanCardProps {
  id: string
  name: string
  duration: string
  difficulty: string
  exercises: number
  muscleGroups: string[]
  scheduled?: string
  featured?: boolean
  onSelect: (id: string) => void
}

const difficultyColor = {
  Beginner: 'text-emerald-400 bg-emerald-400/10',
  Intermediate: 'text-amber-400 bg-amber-400/10',
  Advanced: 'text-red-400 bg-red-400/10',
}

export function WorkoutPlanCard({ id, name, duration, difficulty, exercises, muscleGroups, scheduled, featured, onSelect }: WorkoutPlanCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(id)}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full text-left bg-[var(--color-surface)] rounded-2xl p-4 flex items-center gap-4 touch-feedback",
        featured && "ring-1 ring-[var(--color-primary)]/30"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        featured ? "bg-[var(--color-primary)]/15" : "bg-[var(--color-surface-2)]"
      )}>
        <Dumbbell className={cn("w-5 h-5", featured ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]")} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-[var(--color-foreground)] truncate">{name}</h3>
          {scheduled && (
            <span className="text-[10px] font-semibold bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-2 py-0.5 rounded-full shrink-0">
              {scheduled}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            <span className="text-xs text-[var(--color-muted)]">{duration}</span>
          </div>
          <span className="text-xs text-[var(--color-muted)]">{exercises} exercises</span>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", difficultyColor[difficulty as keyof typeof difficultyColor] || difficultyColor.Intermediate)}>
            {difficulty}
          </span>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {muscleGroups.slice(0, 3).map((m) => (
            <span key={m} className="text-[10px] text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">{m}</span>
          ))}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
    </motion.button>
  )
}
