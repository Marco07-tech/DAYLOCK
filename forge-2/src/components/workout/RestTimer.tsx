import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus } from 'lucide-react'

interface RestTimerProps {
  isVisible: boolean
  onClose: () => void
}

export function RestTimer({ isVisible, onClose }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(90)
  const [isRunning, setIsRunning] = useState(true)
  const total = 90

  useEffect(() => {
    if (!isVisible) { setTimeLeft(90); setIsRunning(true); return }
    if (!isRunning || timeLeft <= 0) return
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, isRunning, isVisible])

  useEffect(() => {
    if (isVisible) { setTimeLeft(90); setIsRunning(true) }
  }, [isVisible])

  const progress = (timeLeft / total) * 100
  const circumference = 2 * Math.PI * 54

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-24 left-4 right-4 bg-[var(--color-surface-2)] rounded-2xl p-6 z-50 border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-[var(--color-foreground)]">Rest Timer</span>
            <button onClick={onClose} className="text-[var(--color-muted)] touch-feedback">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button onClick={() => setTimeLeft(t => Math.max(0, t - 15))} className="touch-feedback">
              <Minus className="w-6 h-6 text-[var(--color-muted)]" />
            </button>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute -rotate-90" width="128" height="128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                <circle
                  cx="64" cy="64" r="54" fill="none"
                  stroke="var(--color-primary)" strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (circumference * progress) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="text-4xl font-bold text-[var(--color-foreground)] tabular-nums">
                {timeLeft}
              </span>
            </div>

            <button onClick={() => setTimeLeft(t => t + 15)} className="touch-feedback">
              <Plus className="w-6 h-6 text-[var(--color-muted)]" />
            </button>
          </div>

          <button
            onClick={() => setIsRunning(r => !r)}
            className="mt-4 w-full py-3 rounded-xl bg-[var(--color-primary)] text-black font-semibold touch-feedback"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
