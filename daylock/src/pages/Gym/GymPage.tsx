import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Apple } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useGymStore } from '../../store/useGymStore'
import { useTaskStore } from '../../store/useTaskStore'
import { cn } from '../../lib/utils'
import { WorkoutLogger } from './components/WorkoutLogger'
import { MySplit } from './components/MySplit'
import { NutritionTab } from './components/NutritionTab'

export function GymPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSection = searchParams.get('s') === 'nutrition' ? 'nutrition' : 'workout'
  const [activeSection, setActiveSection] = useState<'workout' | 'nutrition'>(initialSection)
  const [activeTab, setActiveTab] = useState<'logger' | 'split'>('logger')

  const user = useAuthStore((state) => state.user)
  const todayWorkout = useGymStore((state) => state.todayWorkout)
  const getTodaySplit = useGymStore((state) => state.getTodaySplit)
  const initTodayWorkout = useGymStore((state) => state.initTodayWorkout)
  const completeWorkout = useGymStore((state) => state.completeWorkout)
  const isWorkoutComplete = useGymStore((state) => state.isWorkoutComplete)

  const toggleTaskDone = useTaskStore((state) => state.toggleTaskDone)
  const todayLog = useTaskStore((state) => state.todayLog)
  const tasks = useTaskStore((state) => state.tasks)
  const flushPendingGymSave = useGymStore((state) => state.flushPendingGymSave)

  // Flush pending debounced saves on unmount
  useEffect(() => {
    return () => {
      flushPendingGymSave()
    }
  }, [flushPendingGymSave])

  // Initialize workout on mount if needed
  useEffect(() => {
    if (todayWorkout === null && user) {
      initTodayWorkout(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps — initTodayWorkout is a stable Zustand action reference
  }, [todayWorkout, user])

  const handleCompleteWorkout = async () => {
    if (!user) return
    await completeWorkout(user.id)
    const gymTask = tasks.find((t) => t.type === 'gym')
    if (gymTask && !todayLog[gymTask.id]) {
      await toggleTaskDone(gymTask.id, user.id)
    }
    navigate('/dashboard')
  }

  const todaySplit = getTodaySplit()
  const isRestDay = todaySplit === 'Rest' || todayWorkout?.splitName === 'Rest'

  const totalExercises = todayWorkout?.exercises.length || 0
  const completedExercises =
    todayWorkout?.exercises.filter((ex) => ex.sets.every((set) => set.done)).length || 0
  const progressPercent =
    totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-outline-variant/30 px-container-padding-mobile py-4">
        <div className="flex items-center justify-between max-w-[430px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-on-surface hover:text-primary-fixed-dim transition-colors p-1"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-on-surface flex-1 text-center">Gym</h1>
          <span className="material-symbols-outlined text-primary-fixed-dim">fitness_center</span>
        </div>
        <p className="text-center text-primary-fixed-dim font-label-sm mt-1">
          {todaySplit} {todaySplit !== 'Rest' && 'Day'}
        </p>
      </div>

      {/* Section Switcher: Workout / Nutrition */}
      <div className="px-container-padding-mobile pt-3 pb-0 max-w-[430px] mx-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('workout')}
            className={cn(
              'flex-1 h-10 rounded-xl font-semibold text-sm transition-all duration-150',
              activeSection === 'workout'
                ? 'bg-primary-fixed-dim text-on-primary-fixed'
                : 'bg-surface-container border border-outline-variant text-on-secondary-container hover:border-primary-fixed-dim'
            )}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>fitness_center</span>
              Workout
            </div>
          </button>
          <button
            onClick={() => setActiveSection('nutrition')}
            className={cn(
              'flex-1 h-10 rounded-xl font-semibold text-sm transition-all duration-150',
              activeSection === 'nutrition'
                ? 'bg-primary-fixed-dim text-on-primary-fixed'
                : 'bg-surface-container border border-outline-variant text-on-secondary-container hover:border-primary-fixed-dim'
            )}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Apple size={16} />
              Nutrition
            </div>
          </button>
        </div>
      </div>

      {/* Workout Content */}
      {activeSection === 'workout' && (
        <div className="max-w-[430px] mx-auto px-container-padding-mobile">
          {/* Sub-tab switcher */}
          <div className="py-3">
            <div className="inline-flex p-1 rounded-lg bg-surface-container border border-outline-variant">
              <button
                onClick={() => setActiveTab('logger')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-150',
                  activeTab === 'logger'
                    ? 'bg-primary-fixed-dim text-on-primary-fixed'
                    : 'text-on-secondary-container hover:text-on-surface'
                )}
              >
                Workout Logger
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-150',
                  activeTab === 'split'
                    ? 'bg-primary-fixed-dim text-on-primary-fixed'
                    : 'text-on-secondary-container hover:text-on-surface'
                )}
              >
                My Split
              </button>
            </div>
          </div>

          {activeTab === 'logger' && (
            <>
              <WorkoutLogger />

              {/* Progress and Complete Button */}
              {!isRestDay && todayWorkout && (
                <div className="pt-4 pb-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-on-surface-variant">
                      {completedExercises}/{totalExercises} exercises
                    </span>
                    <span className="font-label-sm text-on-surface-variant">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-fixed-dim rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {isWorkoutComplete() && (
                    <button
                      onClick={handleCompleteWorkout}
                      className="w-full py-4 rounded-xl bg-primary-fixed-dim text-on-primary-fixed font-headline-md active:scale-95 transition-all shadow-[0_10px_40px_rgba(171,214,0,0.15)] flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Complete Workout
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'split' && <MySplit />}
        </div>
      )}

      {/* Nutrition Content */}
      {activeSection === 'nutrition' && (
        <div className="max-w-[430px] mx-auto">
          <NutritionTab />
        </div>
      )}
    </div>
  );
}
