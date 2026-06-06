import { useAuthStore } from '../../store/useAuthStore'
import { BottomNav } from '../../components/layout/BottomNav'

export default function ProfilePage() {
  const { profile, signOut } = useAuthStore()

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() ?? 'FF'

  const targets = [
    { icon: 'local_fire_department', label: 'Calories', value: profile?.calorie_goal ?? 1800, unit: 'kcal' },
    { icon: 'egg_alt', label: 'Protein', value: profile?.protein_goal ?? 160, unit: 'g' },
    { icon: 'water_drop', label: 'Water', value: profile?.water_goal ?? 8, unit: 'glasses' },
    { icon: 'monitor_weight', label: 'Weight', value: profile?.body_weight ? `${profile.body_weight} kg` : '--', unit: '' },
  ]

  return (
    <div className="bg-background min-h-screen pb-[84px]">
      <div className="page-enter">
        <header className="sticky top-0 bg-background z-40 px-md pt-6 pb-3 border-b border-ff-border">
          <div className="max-w-lg mx-auto">
            <h1 className="font-display text-display-sm text-white uppercase">Profile</h1>
          </div>
        </header>

        <div className="px-md space-y-4 max-w-lg mx-auto pb-8 pt-4">
          {/* User card */}
          <div className="ff-card p-md flex items-center gap-md">
            <div className="w-14 h-14 rounded-full bg-ff-accent/20 flex items-center justify-center">
              <span className="font-display font-bold text-lg text-ff-accent">{initials}</span>
            </div>
            <div className="flex-1">
              <p className="font-display text-headline-md text-white flex items-center gap-2">
                {profile?.display_name ?? 'Athlete'}
                <span className="material-symbols-outlined text-[16px] text-ff-accent"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>
                  verified
                </span>
              </p>
              <p className="font-body-md text-ff-muted">{profile?.email}</p>
            </div>
          </div>

          {/* Target thresholds */}
          <p className="font-label-caps text-label-caps text-ff-accent uppercase tracking-widest">TARGET THRESHOLDS</p>
          <div className="grid grid-cols-2 gap-3">
            {targets.map((t) => (
              <div key={t.label} className="ff-card p-md">
                <div className="flex items-start justify-between mb-2">
                  <span className="material-symbols-outlined text-ff-accent text-[20px]">{t.icon}</span>
                </div>
                <p className="font-label-caps text-label-caps text-ff-muted">{t.label}</p>
                <p className="font-display text-headline-md text-white mt-1">{t.value}</p>
                {t.unit && <p className="font-label-caps text-label-caps text-ff-muted">{t.unit}</p>}
              </div>
            ))}
          </div>

          {/* Application */}
          <p className="font-label-caps text-label-caps text-ff-accent uppercase tracking-widest pt-2">APPLICATION</p>
          <div className="ff-card overflow-hidden">
            <div className="flex items-center justify-between px-md py-sm border-b border-ff-border">
              <span className="font-body-md text-white">About ForgeFit</span>
              <span className="material-symbols-outlined text-ff-muted">chevron_right</span>
            </div>
            <div className="flex items-center justify-between px-md py-sm">
              <span className="font-body-md text-white">Version</span>
              <span className="font-body-md text-ff-muted">v1.0.0</span>
            </div>
          </div>

          {/* Account */}
          <p className="font-label-caps text-label-caps text-ff-accent uppercase tracking-widest pt-2">ACCOUNT</p>
          <button
            onClick={signOut}
            className="w-full text-center py-4 font-label-caps text-label-caps text-red-400 hover:text-red-300 transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
