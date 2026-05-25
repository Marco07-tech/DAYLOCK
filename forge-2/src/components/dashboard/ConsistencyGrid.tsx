import { cn } from '@/utils/cn'

interface ConsistencyGridProps {
  data: { day: number; level: number }[]
}

export function ConsistencyGrid({ data }: ConsistencyGridProps) {
  const getLevelColor = (level: number) => {
    if (level === 0) return 'bg-[var(--color-surface-2)]'
    if (level === 1) return 'bg-[var(--color-primary)]/25'
    if (level === 2) return 'bg-[var(--color-primary)]/50'
    if (level === 3) return 'bg-[var(--color-primary)]/75'
    return 'bg-[var(--color-primary)]'
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Consistency</h3>
        <span className="text-xs text-[var(--color-muted)]">Last 28 days</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {data.map((d) => (
          <div
            key={d.day}
            className={cn('aspect-square rounded-sm', getLevelColor(d.level))}
          />
        ))}
      </div>
    </div>
  )
}
