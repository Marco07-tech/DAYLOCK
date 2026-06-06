import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { BottomNav } from '../../components/layout/BottomNav'

type Range = 'week' | 'month' | 'all'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ProgressPage() {
  const { profile } = useAuthStore()
  const { sessions, loadRecentSessions } = useWorkoutStore()
  const [range, setRange] = useState<Range>('week')

  const userId = profile?.id

  useEffect(() => {
    if (!userId) return
    loadRecentSessions(userId)
  }, [userId])

  const totalWorkouts = sessions.length
  const totalSets = sessions.reduce((sum, s) => sum + s.sets.length, 0)
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0
  const totalVolume = sessions.reduce((sum, s) =>
    sum + s.sets.reduce((setSum, set) => setSum + ((set.weight_kg ?? 0) * (set.reps ?? 0)), 0), 0
  )

  const todayIndex = new Date().getDay()

  const weeklyVolumes = WEEK_DAYS.map((_, i) => {
    const daySessions = sessions.filter((s) => {
      const d = new Date(s.date)
      return d.getDay() === i
    })
    return daySessions.reduce((sum, s) =>
      sum + s.sets.reduce((setSum, set) => setSum + ((set.weight_kg ?? 0) * (set.reps ?? 0)), 0), 0
    )
  })

  const maxVolume = Math.max(...weeklyVolumes)

  const muscleGroups = ['LEGS', 'BACK', 'CHEST', 'SHOULDERS']
  const muscleSets = muscleGroups.map((mg) => ({
    name: mg.charAt(0) + mg.slice(1).toLowerCase(),
    sets: sessions.reduce((sum, s) =>
      sum + s.sets.filter((set) => set.muscle_group === mg).length, 0
    ),
  }))
  const maxMuscleSets = Math.max(...muscleSets.map((m) => m.sets), 1)

  return (
    <div className="bg-background min-h-screen pb-[84px]">
      <div className="page-enter">
        <header className="sticky top-0 bg-background z-40 px-md pt-6 pb-3 border-b border-ff-border">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <p className="font-display text-ff-accent uppercase text-lg tracking-[0.2em]">FORGEFIT</p>
            <h1 className="font-display text-display-sm text-white">Progress</h1>
          </div>
        </header>

        <div className="px-md space-y-4 max-w-lg mx-auto pb-8 pt-4">
          {/* Date range tabs */}
          <div className="bg-surface-container-low border border-ff-border rounded-lg p-[2px] flex">
            {(['week', 'month', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 py-1.5 rounded-md font-label-caps text-label-caps text-center transition-colors ${
                  range === r ? 'bg-surface-variant text-white' : 'text-outline'
                }`}
              >
                {r === 'week' ? 'Week' : r === 'month' ? 'Month' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Workout stats */}
          <div className="ff-card p-md">
            <div className="flex items-end gap-2">
              <span className="font-display text-display-lg text-white">{totalWorkouts}</span>
              <span className="font-label-caps text-label-caps text-ff-muted pb-2">WORKOUTS</span>
            </div>
            <div className="h-px bg-ff-border my-3" />
            <div className="flex justify-between">
              <div>
                <p className="font-label-caps text-label-caps text-ff-muted">TOTAL SETS</p>
                <p className="font-data-mono text-data-mono text-white">{totalSets}</p>
              </div>
              <div className="text-right">
                <p className="font-label-caps text-label-caps text-ff-muted">AVG DURATION</p>
                <p className="font-data-mono text-data-mono text-white">{avgDuration}m</p>
              </div>
            </div>
          </div>

          {/* Weekly volume */}
          <div className="ff-card p-md">
            <div className="flex items-center justify-between mb-3">
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">WEEKLY VOLUME</p>
              <span className="material-symbols-outlined text-ff-muted">bar_chart</span>
            </div>
            <p className="font-display text-headline-md text-white mb-4">
              {totalVolume.toLocaleString()} kg
            </p>
            <div className="h-[120px] flex items-end justify-between gap-1">
              {weeklyVolumes.map((vol, i) => {
                const pct = maxVolume > 0 ? (vol / maxVolume) * 100 : 0
                const isToday = i === todayIndex
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-full max-w-[24px] rounded-t-sm transition-all ${
                        pct > 0 ? (isToday ? 'bg-ff-accent' : 'bg-ff-accent/60') : 'bg-surface-variant'
                      }`}
                      style={{ height: Math.max(pct > 0 ? (pct / 100) * 100 : 8, pct > 0 ? 8 : 8) + '%' }}
                    />
                    <span className={`font-label-caps text-label-caps ${isToday ? 'text-ff-accent' : 'text-outline'}`}>
                      {DAYS[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Muscle groups */}
          <div className="ff-card p-md">
            <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest mb-3">MUSCLE GROUPS (SETS)</p>
            <div className="space-y-3">
              {muscleSets.map((m) => (
                <div key={m.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-body-md text-white">{m.name}</span>
                    <span className="font-data-mono text-data-mono text-ff-muted">{m.sets}</span>
                  </div>
                  <div className="ff-progress-track">
                    <div
                      className="ff-progress-fill"
                      style={{ width: `${(m.sets / maxMuscleSets) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body weight */}
          <div className="ff-card p-md">
            <div className="flex items-center justify-between mb-3">
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">BODY WEIGHT</p>
              <button className="border border-ff-border text-ff-muted px-3 py-1 rounded-full font-label-caps text-label-caps">
                + LOG WEIGHT
              </button>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-headline-md text-white">{profile?.body_weight ?? '-'}</span>
              <span className="font-label-caps text-label-caps text-ff-muted">kg</span>
              <span className="font-data-mono text-data-mono text-red-400 ml-2">-0.8</span>
            </div>
            {/* Simple SVG line chart */}
            <div className="h-[80px] mt-3">
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M5 35 L15 30 L25 32 L35 25 L45 28 L55 20 L65 22 L75 15 L85 18 L95 10"
                  stroke="#4F6EF7"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.6"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between mt-1">
                {['1st Oct', '8th Oct', '15th Oct', '22nd Oct', 'Today'].map((d) => (
                  <span key={d} className="font-label-caps text-label-caps text-outline">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
