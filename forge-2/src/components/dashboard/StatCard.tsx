import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  iconColor: string
  value: number | string
  unit: string
  label: string
  progress?: number
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function StatCard({ icon: Icon, iconColor, value, unit, label, progress }: StatCardProps) {
  return (
    <motion.div
      variants={item}
      className="bg-[var(--color-surface)] rounded-2xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {progress !== undefined && (
          <span className="text-xs font-semibold text-[var(--color-muted)]">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[var(--color-foreground)]">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-sm text-[var(--color-muted)]">{unit}</span>}
        </div>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">{label}</p>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-primary)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.div>
  )
}
