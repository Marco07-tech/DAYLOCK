import { useLocation, Link } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/workout', label: 'Workout', icon: 'exercise' },
  { path: '/nutrition', label: 'Nutrition', icon: 'restaurant' },
  { path: '/progress', label: 'Progress', icon: 'insights' },
  { path: '/profile', label: 'Profile', icon: 'person' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 w-full z-50 h-[84px] bg-[#0D0D0D] border-t border-ff-border">
      <div className="flex justify-around items-center px-md h-full pb-safe">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${
                isActive ? 'text-ff-accent' : 'text-ff-muted'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] select-none"
                style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                {tab.icon}
              </span>
              <span className="font-label-caps text-label-caps">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
