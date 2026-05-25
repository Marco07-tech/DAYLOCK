import { Bell, Settings } from 'lucide-react'

interface HeaderProps {
  userName: string
}

export function Header({ userName }: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      <div>
        <p className="text-sm text-[var(--color-muted)] font-medium">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{userName} 👋</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center touch-feedback">
          <Bell className="w-5 h-5 text-[var(--color-muted)]" />
        </button>
        <button className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center touch-feedback">
          <Settings className="w-5 h-5 text-[var(--color-muted)]" />
        </button>
      </div>
    </header>
  )
}
