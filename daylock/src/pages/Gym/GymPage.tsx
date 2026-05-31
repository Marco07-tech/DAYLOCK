import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useGymStore } from '../../store/useGymStore'
import { useTaskStore } from '../../store/useTaskStore'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { WorkoutLogger } from './components/WorkoutLogger'
import { MySplit } from './components/MySplit'

export function GymPage() {
  const navigate = useNavigate()
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

  // Initialize workout on mount if needed
  useEffect(() => {
    if (todayWorkout === null && user) {
      initTodayWorkout(user.id)
    }
  }, [todayWorkout, initTodayWorkout, user])

  const handleCompleteWorkout = async () => {
    if (!user) return
    await completeWorkout(user.id)
    // Find and toggle the gym task
    const gymTask = tasks.find((t) => t.type === 'gym')
    if (gymTask && !todayLog[gymTask.id]) {
      await toggleTaskDone(gymTask.id, user.id)
    }
    navigate('/dashboard')
  }

  const todaySplit = getTodaySplit()
  const isRestDay = todaySplit === 'Rest' || todayWorkout?.splitName === 'Rest'

  // Calculate progress
  const totalExercises = todayWorkout?.exercises.length || 0
  const completedExercises =
    todayWorkout?.exercises.filter((ex) => ex.sets.every((set) => set.done)).length || 0
  const progressPercent =
    totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  return (
    <div className="min-h-screen bg-bg-primary pb-20 page-enter">
      {/* Header */}
      <div className="border-b border-bg-border px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="text-text-primary hover:text-accent-lime transition-colors p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-text-primary text-xl font-semibold flex-1 text-center">Gym</h1>
          <div className="text-accent-lime p-1">
            <Dumbbell size={20} />
          </div>
        </div>
        <p className="text-center text-accent-lime text-xs font-medium">
          {todaySplit} {todaySplit !== 'Rest' && 'Day'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-3 bg-bg-primary">
        <button
          onClick={() => setActiveTab('logger')}
          className={cn(
            'flex-1 h-10 rounded-xl font-semibold text-sm transition-all duration-150',
            activeTab === 'logger'
              ? 'bg-accent-lime text-black'
              : 'bg-bg-card border border-bg-border text-text-secondary hover:border-accent-lime'
          )}
        >
          Workout Logger
        </button>
        <button
          onClick={() => setActiveTab('split')}
          className={cn(
            'flex-1 h-10 rounded-xl font-semibold text-sm transition-all duration-150',
            activeTab === 'split'
              ? 'bg-accent-lime text-black'
              : 'bg-bg-card border border-bg-border text-text-secondary hover:border-accent-lime'
          )}
        >
          My Split
        </button>
      </div>

      {/* Content */}
      {activeTab === 'logger' && (
        <>
          <WorkoutLogger />

          {/* Progress and Complete Button */}
          {!isRestDay && todayWorkout && (
            <div className="px-4 pb-4">
              <div className="mb-3">
                <p className="text-text-secondary text-xs mb-2">
                  {completedExercises}/{totalExercises} exercises
                </p>
                <ProgressBar percent={progressPercent} />
              </div>

              {isWorkoutComplete() && (
                <Button
                  variant="primary"
                  onClick={handleCompleteWorkout}
                  className="w-full h-14 text-base font-semibold"
                >
                  Complete Workout 💪
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'split' && <MySplit />}
    </div>
  );
}
