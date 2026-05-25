import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { LayoutGrid, Dumbbell, Footprints, History, Apple, User } from 'lucide-react'

export type TabId = 'dashboard' | 'workout' | 'steps' | 'history' | 'nutrition' | 'profile'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutGrid },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'steps', label: 'Steps', icon: Footprints },
  { id: 'history', label: 'History', icon: History },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'profile', label: 'Profile', icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-border)] safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors touch-feedback",
                isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wide relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
