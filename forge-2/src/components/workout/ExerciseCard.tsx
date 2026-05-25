import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Set {
  id: number
  reps: number
  weight: number
  completed: boolean
}

interface ExerciseCardProps {
  name: string
  muscleGroup: string
  sets: Set[]
  onSetComplete: (setId: number) => void
}

export function ExerciseCard({ name, muscleGroup, sets, onSetComplete }: ExerciseCardProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-[var(--color-foreground)]">{name}</h3>
        <p className="text-xs text-[var(--color-muted)]">{muscleGroup}</p>
      </div>
      
      {/* Set headers */}
      <div className="grid grid-cols-4 mb-2 px-1">
        <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase">Set</span>
        <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase text-center">Prev</span>
        <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase text-center">Reps</span>
        <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase text-center">Done</span>
      </div>

      <div className="space-y-2">
        {sets.map((set, i) => (
          <div
            key={set.id}
            className={cn(
              "grid grid-cols-4 items-center px-1 py-2 rounded-xl transition-colors",
              set.completed ? "bg-[var(--color-primary)]/10" : "bg-[var(--color-surface-2)]"
            )}
          >
            <span className={cn("text-sm font-bold", set.completed ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]")}>
              {i + 1}
            </span>
            <span className="text-sm text-[var(--color-muted)] text-center">{set.weight}kg</span>
            <span className={cn("text-sm font-semibold text-center", set.completed ? "text-[var(--color-foreground)]" : "text-[var(--color-foreground)]")}>
              {set.reps}
            </span>
            <div className="flex justify-center">
              <button onClick={() => onSetComplete(set.id)} className="touch-feedback">
                {set.completed
                  ? <CheckCircle2 className="w-6 h-6 text-[var(--color-primary)]" />
                  : <Circle className="w-6 h-6 text-[var(--color-border)]" />
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
