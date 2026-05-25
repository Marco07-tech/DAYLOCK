import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Timer, CheckCircle2 } from 'lucide-react'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { RestTimer } from '@/components/workout/RestTimer'
import { exercises as mockExercises, workoutPlans } from '@/data/mock-data'

interface ActiveWorkoutProps {
  workoutId: string
  onBack: () => void
  onFinish: () => void
}

export function ActiveWorkout({ workoutId, onBack, onFinish }: ActiveWorkoutProps) {
  const workout = workoutPlans.find(w => w.id === workoutId) || workoutPlans[0]
  const [exercises, setExercises] = useState(mockExercises)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showRestTimer, setShowRestTimer] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleSetComplete = (exerciseId: string, setId: number) => {
    setExercises(prev => prev.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s) }
        : ex
    ))
    setShowRestTimer(true)
  }

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0)
  const completedSets = exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0)
  const progress = (completedSets / totalSets) * 100

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-[var(--color-background)]/95 backdrop-blur-lg safe-top">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-[var(--color-surface)] transition-colors touch-feedback">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-bold tabular-nums">{formatTime(elapsedTime)}</span>
          </div>
          <div className="w-10" />
        </div>
        <div className="h-1 bg-[var(--color-border)]">
          <motion.div className="h-full bg-[var(--color-primary)]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div className="px-5 py-3 border-b border-[var(--color-border)]">
          <h1 className="text-lg font-bold">{workout.name}</h1>
          <p className="text-sm text-[var(--color-muted)]">{completedSets}/{totalSets} sets completed</p>
        </div>
      </header>

      <main className="px-5 py-4 space-y-4">
        {exercises.map((exercise, i) => (
          <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <ExerciseCard name={exercise.name} muscleGroup={exercise.muscleGroup} sets={exercise.sets} onSetComplete={(setId) => handleSetComplete(exercise.id, setId)} />
          </motion.div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-[var(--color-background)]/95 backdrop-blur-lg border-t border-[var(--color-border)]">
        <div className="flex gap-3">
          <button onClick={() => setShowRestTimer(true)} className="flex-1 py-3.5 rounded-xl bg-[var(--color-surface)] font-semibold touch-feedback">
            Rest Timer
          </button>
          <motion.button onClick={onFinish} whileTap={{ scale: 0.98 }} className="flex-1 py-3.5 rounded-xl bg-[var(--color-primary)] text-black font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Finish
          </motion.button>
        </div>
      </div>

      <RestTimer isVisible={showRestTimer} onClose={() => setShowRestTimer(false)} />
    </div>
  )
}
