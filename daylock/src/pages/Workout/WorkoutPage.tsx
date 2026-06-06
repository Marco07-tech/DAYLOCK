import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { AddExerciseSheet } from '../../components/AddExerciseSheet'
import { BottomNav } from '../../components/layout/BottomNav'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function WorkoutPage() {
  const { profile } = useAuthStore()
  const { activeSession, split, sessions, loadTodaySession, loadSplit, loadRecentSessions, startWorkout, addExercise, addSet, updateSet, toggleSetDone, finishWorkout, timerStart } = useWorkoutStore()
  const [tab, setTab] = useState<'logger' | 'split'>('logger')
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [timer, setTimer] = useState(0)

  const userId = profile?.id
  const today = new Date()
  const todayDay = today.getDay()
  const todaySplit = split.find((d) => d.day_of_week === todayDay)

  useEffect(() => {
    if (!userId) return
    loadTodaySession(userId)
    loadSplit(userId)
    loadRecentSessions(userId)
  }, [userId])

  useEffect(() => {
    if (!timerStart) return
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - timerStart) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [timerStart])

  const handleAddExercise = async (name: string, muscleGroup: string) => {
    if (!userId) return
    await addExercise(userId, name, muscleGroup)
    setShowAddExercise(false)
  }

  const handleFinish = async () => {
    if (!activeSession) return
    const duration = Math.floor((Date.now() - (timerStart ?? Date.now())) / 60000)
    await finishWorkout(activeSession.id, duration)
  }

  const handleStartWorkout = async () => {
    if (!userId) return
    await startWorkout(userId, todaySplit?.workout_name ?? 'Workout')
  }

  const handleAddSet = async (exerciseName: string, muscleGroup: string) => {
    if (!userId || !activeSession) return
    await addSet({
      session_id: activeSession.id,
      user_id: userId,
      exercise_name: exerciseName,
      muscle_group: muscleGroup,
      set_number: activeSession.sets.filter((s) => s.exercise_name === exerciseName).length + 1,
      weight_kg: null,
      reps: null,
      done: false,
    })
  }

  const exercises = activeSession
    ? [...new Map(activeSession.sets.map((s) => [s.exercise_name, s])).values()]
    : []

  const allDone = activeSession
    ? activeSession.sets.length > 0 && activeSession.sets.every((s) => s.done)
    : false

  return (
    <div className="bg-background min-h-screen pb-[84px]">
      <div className="page-enter">
        <header className="sticky top-0 bg-background z-40 px-md pt-6 pb-2 border-b border-ff-border">
          <div className="max-w-lg mx-auto flex items-center justify-between mb-2">
            <p className="font-display text-ff-accent uppercase text-lg tracking-[0.2em]">FORGEFIT</p>
            <button className="text-ff-muted">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-display text-display-sm text-white">Workout</h1>
              <p className="font-label-caps text-label-caps text-ff-muted uppercase mt-1">
                {todaySplit?.workout_name ?? 'Rest Day'} {todaySplit && !todaySplit.is_rest ? '· CHEST / SHOULDERS / TRICEPS' : ''}
              </p>
            </div>
            {timerStart && (
              <div className="bg-surface-container border border-ff-border rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-ff-muted">timer</span>
                <span className="font-data-mono text-data-mono text-ff-accent">{formatTime(timer)}</span>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-lg mx-auto px-md">
          {/* Tabs */}
          <div className="flex border-b border-ff-border mb-4">
            {(['logger', 'split'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 font-label-caps text-label-caps uppercase tracking-widest transition-colors ${
                  tab === t
                    ? 'text-ff-accent border-b-2 border-ff-accent'
                    : 'text-ff-muted'
                }`}
              >
                {t === 'logger' ? 'Logger' : 'My Split'}
              </button>
            ))}
          </div>

          {tab === 'logger' && (
            <div className="pb-4">
              {!activeSession && (
                <div className="ff-card p-lg text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-ff-muted mb-3">exercise</span>
                  <p className="text-ff-muted font-body-md mb-4">No active workout.</p>
                  <button onClick={handleStartWorkout} className="ff-btn-primary max-w-[200px] mx-auto">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    START WORKOUT
                  </button>
                </div>
              )}

              {activeSession && exercises.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-ff-muted font-body-md mb-4">No exercises yet. Add one to begin.</p>
                </div>
              )}

              {activeSession && exercises.map((ex) => {
                const exerciseSets = activeSession.sets.filter((s) => s.exercise_name === ex.exercise_name)
                return (
                  <div key={ex.exercise_name} className="mb-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-display text-display-sm tracking-tight text-white">{ex.exercise_name}</h3>
                        <span className="font-label-caps text-label-caps text-ff-muted mt-1 inline-block">{ex.muscle_group}</span>
                      </div>
                      <button className="text-ff-muted">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>

                    <div className="list-separator pb-xs mb-xs">
                      <div className="grid grid-cols-[3fr_3fr_3fr_1fr] font-label-caps text-label-caps text-ff-muted py-1">
                        <span className="text-center">SET</span>
                        <span className="text-center">KG</span>
                        <span className="text-center">REPS</span>
                        <span className="text-center">DONE</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {exerciseSets.map((set, i) => (
                        <div
                          key={set.id}
                          className={`grid grid-cols-[3fr_3fr_3fr_1fr] items-center py-xs rounded-lg transition-all duration-200 ${
                            set.done ? 'opacity-60' : i === exerciseSets.length - 1 ? 'bg-surface-container-high border border-ff-border -mx-2 px-2' : ''
                          }`}
                        >
                          <div className={`text-center font-data-mono text-data-mono ${
                            !set.done && i === exerciseSets.length - 1 ? 'bg-ff-accent text-white px-2 py-1 rounded-full mx-auto w-fit' : 'text-ff-muted'
                          }`}>
                            {i + 1}
                          </div>

                          <div className="flex justify-center">
                            {set.done ? (
                              <span className="font-data-mono text-data-mono text-ff-muted line-through">{set.weight_kg ?? '-'}</span>
                            ) : (
                              <input
                                type="number"
                                value={set.weight_kg ?? ''}
                                onChange={(e) => updateSet(set.id, { weight_kg: e.target.value ? Number(e.target.value) : null })}
                                className={`w-14 bg-transparent text-center font-data-mono outline-none transition-colors ${
                                  i === exerciseSets.length - 1 ? 'border-b-2 border-ff-accent text-ff-accent' : 'border-b border-ff-border text-white'
                                }`}
                                placeholder="-"
                              />
                            )}
                          </div>

                          <div className="flex justify-center">
                            {set.done ? (
                              <span className="font-data-mono text-data-mono text-ff-muted line-through">{set.reps ?? '-'}</span>
                            ) : (
                              <input
                                type="number"
                                value={set.reps ?? ''}
                                onChange={(e) => updateSet(set.id, { reps: e.target.value ? Number(e.target.value) : null })}
                                className={`w-12 bg-transparent text-center font-data-mono outline-none transition-colors ${
                                  i === exerciseSets.length - 1 ? 'border-b border-ff-border text-white' : 'border-b border-ff-border text-white'
                                }`}
                                placeholder="-"
                              />
                            )}
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleSetDone(set.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                                set.done ? 'bg-ff-accent border-ff-accent' : 'border-ff-border hover:border-ff-accent'
                              }`}
                            >
                              {set.done && (
                                <span className="material-symbols-outlined text-white text-[14px]"
                                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 20" }}>
                                  check
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddSet(ex.exercise_name, ex.muscle_group)}
                      className="flex items-center gap-1.5 mt-2 text-ff-muted hover:text-ff-accent transition-colors font-label-caps text-label-caps"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      ADD SET
                    </button>

                    <div className="h-px bg-ff-border my-xl" />
                  </div>
                )
              })}

              {activeSession && (
                <div className="space-y-2 pb-4">
                  <button onClick={() => setShowAddExercise(true)} className="ff-btn-primary">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    ADD EXERCISE
                  </button>
                  {allDone && (
                    <button onClick={handleFinish} className="ff-btn-secondary">
                      FINISH WORKOUT
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'split' && (
            <div className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-headline-md text-white">Current Week</h3>
                <span className="font-label-caps text-label-caps text-ff-muted">Wk -- of 8</span>
              </div>

              <div className="ff-card overflow-hidden">
                {split.length === 0 && (
                  <div className="text-center py-8 px-md">
                    <p className="text-ff-muted font-body-md">No split configured. Complete onboarding first.</p>
                  </div>
                )}
                {DAY_NAMES.map((dayName, i) => {
                  const daySplit = split.find((d) => d.day_of_week === i)
                  const isToday = i === todayDay
                  const todaySessions = sessions.filter((s) => {
                    const d = new Date(s.date)
                    return d.getDay() === i
                  })
                  const isCompleted = todaySessions.length > 0 && todaySessions.some((s) => s.completed)
                  const isRest = daySplit?.is_rest ?? true

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-md py-sm border-b border-ff-border transition-colors ${
                        isToday ? 'border-l-4 border-l-ff-accent bg-ff-accent/5' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="font-label-caps text-label-caps text-ff-accent font-bold">
                              {dayName.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                          {!isToday && (
                            <span className={`font-label-caps text-label-caps ${isCompleted ? 'text-ff-muted' : 'text-ff-muted'}`}>
                              {dayName.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {isRest ? (
                          <span className="font-body-md text-ff-muted italic flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">bedtime</span>
                            Rest
                          </span>
                        ) : (
                          <span className={`font-body-md ${isCompleted ? 'text-ff-muted line-through opacity-60' : isToday ? 'text-ff-accent font-bold' : 'text-white'}`}>
                            {daySplit?.workout_name ?? 'Workout'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="material-symbols-outlined text-ff-accent text-[20px]"
                            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>
                            check_circle
                          </span>
                        )}
                        {isRest && !isCompleted && (
                          <span className="material-symbols-outlined text-outline-variant text-[20px]">bedtime</span>
                        )}
                        {!isRest && !isCompleted && !isToday && (
                          <span className="material-symbols-outlined text-outline-variant text-[20px]">radio_button_unchecked</span>
                        )}
                        {isToday && !isCompleted && !isRest && (
                          <button
                            onClick={handleStartWorkout}
                            className="bg-ff-accent text-white px-4 py-1.5 rounded-full font-label-caps text-label-caps active:scale-95 transition-all shadow-sm"
                          >
                            START
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Consistency card */}
              <div className="ff-card p-md mt-4">
                <div className="flex items-center justify-between">
                  <p className="font-label-caps text-label-caps text-ff-accent uppercase tracking-widest">CONSISTENCY</p>
                  <p className="font-data-mono text-data-mono text-ff-accent">80%</p>
                </div>
                <p className="font-display text-display-sm text-white mt-1">12 Days Active</p>
                <div className="flex gap-1 mt-3">
                  {[70, 100, 85, 65].map((pct, i) => (
                    <div key={i} className="flex-1 ff-progress-track h-2">
                      <div className="ff-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {['WK 1', 'WK 2', 'WK 3', 'WK 4'].map((w) => (
                    <span key={w} className="font-label-caps text-label-caps text-ff-muted">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddExercise && userId && (
        <AddExerciseSheet
          userId={userId}
          onSelect={handleAddExercise}
          onClose={() => setShowAddExercise(false)}
        />
      )}

      <BottomNav />
    </div>
  )
}
