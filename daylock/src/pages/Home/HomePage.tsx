import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { useNutritionStore } from '../../store/useNutritionStore'
import { BottomNav } from '../../components/layout/BottomNav'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { activeSession, sessions, split, loadTodaySession, loadSplit, loadRecentSessions, startWorkout } = useWorkoutStore()
  const { todayLog, loadToday } = useNutritionStore()

  const userId = profile?.id
  const firstName = profile?.display_name?.split(' ')[0] ?? 'there'
  const today = new Date()
  const dayName = DAYS[today.getDay()]
  const dateStr = dayName + ', ' + today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const todaySplit = split.find((d) => d.day_of_week === today.getDay())

  useEffect(() => {
    if (!userId) return
    loadTodaySession(userId)
    loadSplit(userId)
    loadRecentSessions(userId)
    if (profile) {
      loadToday(userId, profile.calorie_goal, profile.protein_goal, profile.water_goal)
    }
  }, [userId])

  const handleStartWorkout = async () => {
    if (!userId) return
    await startWorkout(userId, todaySplit?.workout_name ?? 'Workout')
    navigate('/workout')
  }

  const totalCalories = todayLog
    ? todayLog.breakfast_kcal + todayLog.lunch_kcal + todayLog.dinner_kcal + todayLog.snacks_kcal
    : 0

  const lastSession = sessions[0]
  const totalSets = lastSession?.sets.length ?? 0
  const uniqueExercises = lastSession
    ? [...new Set(lastSession.sets.map((s) => s.exercise_name))].length
    : 0

  return (
    <div className="bg-background min-h-screen pb-[84px]">
      <div className="page-enter">
        <header className="sticky top-0 bg-background z-40 px-md pt-6 pb-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <p className="font-display text-ff-accent uppercase text-lg tracking-[0.2em]">FORGEFIT</p>
            <button className="text-ff-muted">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="px-md space-y-4 max-w-lg mx-auto pb-8">
          <div>
            <p className="font-label-caps text-label-caps text-ff-accent uppercase tracking-widest mb-1">FORGEFIT</p>
            <h1 className="font-display text-display-sm text-white">Let's forge, {firstName}</h1>
            <p className="text-ff-muted font-body-md">{dateStr}</p>
          </div>

          {!userId ? (
            <div className="ff-card p-lg space-y-3 animate-pulse">
              <div className="h-3 w-24 bg-surface-container-high rounded" />
              <div className="h-8 w-40 bg-surface-container-high rounded" />
              <div className="h-4 w-32 bg-surface-container-high rounded" />
            </div>
          ) : (
            <div
              className="ff-card border-l-4 border-l-ff-accent p-lg cursor-pointer active:scale-[0.99] transition-transform"
              onClick={handleStartWorkout}
            >
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">TODAY'S WORKOUT</p>
              <h2 className="font-display text-display-lg uppercase text-white leading-none mt-2">
                {todaySplit?.workout_name ?? 'Rest Day'}
              </h2>
              {todaySplit && !todaySplit.is_rest && (
                <div className="flex gap-2 mt-3">
                  <span className="ff-pill">Chest</span>
                  <span className="ff-pill">Shoulders</span>
                  <span className="ff-pill">Triceps</span>
                </div>
              )}
              {activeSession ? (
                <button className="ff-btn-primary mt-4">
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  RESUME WORKOUT
                </button>
              ) : todaySplit && !todaySplit.is_rest ? (
                <button className="ff-btn-primary mt-4">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  START WORKOUT
                </button>
              ) : (
                <p className="text-ff-muted font-body-md mt-4 italic">Rest day. Recover and recharge.</p>
              )}
            </div>
          )}

          {/* Nutrition card */}
          <div className="ff-card p-md cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate('/nutrition')}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">NUTRITION</p>
              <p className="text-ff-accent font-bold font-label-caps">
                {profile && todayLog ? Math.round((totalCalories / profile.calorie_goal) * 100) : 0}%
              </p>
            </div>
            <div className="list-separator pb-3 mb-3 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-caps text-label-caps text-ff-muted">CALORIES</span>
                  <span className="font-label-caps text-label-caps text-white">{totalCalories} / {profile?.calorie_goal ?? 1800}</span>
                </div>
                <div className="ff-progress-track">
                  <div className="ff-progress-fill" style={{ width: `${profile ? Math.min((totalCalories / profile.calorie_goal) * 100, 100) : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-caps text-label-caps text-ff-muted">PROTEIN</span>
                  <span className="font-label-caps text-label-caps text-white">
                    {todayLog ? todayLog.breakfast_protein + todayLog.lunch_protein + todayLog.dinner_protein + todayLog.snacks_protein : 0}g / {profile?.protein_goal ?? 160}g
                  </span>
                </div>
                <div className="ff-progress-track">
                  <div className="ff-progress-fill bg-tertiary-container" style={{
                    width: `${profile ? Math.min(((todayLog?.breakfast_protein ?? 0) + (todayLog?.lunch_protein ?? 0) + (todayLog?.dinner_protein ?? 0) + (todayLog?.snacks_protein ?? 0)) / profile.protein_goal * 100, 100) : 0}%`
                  }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label-caps text-label-caps text-ff-muted">WATER</span>
                  <span className="font-label-caps text-label-caps text-white">{todayLog?.water_glasses ?? 0} / {todayLog?.water_goal ?? 8}</span>
                </div>
                <div className="ff-progress-track">
                  <div className="ff-progress-fill" style={{ width: `${todayLog ? (todayLog.water_glasses / todayLog.water_goal) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Last session card */}
          {lastSession && (
            <div className="ff-card p-md flex items-center justify-between" onClick={() => navigate('/workout')}>
              <div>
                <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">LAST SESSION</p>
                <p className="font-body-lg text-white font-bold mt-1">{lastSession.name}</p>
              </div>
              <div className="text-right">
                <p className="font-label-caps text-label-caps text-ff-muted">{uniqueExercises} exercises · {totalSets} sets</p>
                <p className="font-display text-headline-md text-white">{lastSession.duration_minutes ?? '-'}m</p>
              </div>
            </div>
          )}

          {!lastSession && userId && (
            <div className="ff-card p-md text-center py-8">
              <p className="text-ff-muted font-body-md">No workouts yet. Start your first session today!</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
