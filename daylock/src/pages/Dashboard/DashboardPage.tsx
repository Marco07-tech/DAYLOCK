import { useEffect, useState, useRef } from 'react'
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGymStore } from '../../store/useGymStore';
import { getGreeting, formatDate } from '../../lib/utils';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { BlockerBanner } from './components/BlockerBanner';
import { StatsRow } from './components/StatsRow';
import { TaskList } from './components/TaskList';
import { AddTaskSheet } from '../AddTask/AddTaskSheet';

type ToastType = {
  message: string;
  variant?: 'success' | 'error';
  action?: () => void;
  actionLabel?: string;
};

export function DashboardPage() {
  const [showAddTask, setShowAddTask] = useState(false)
  const [toast, setToast] = useState<ToastType | null>(null)
  const [pendingUndoTaskId, setPendingUndoTaskId] = useState<string | null>(null)
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const user = useAuthStore((state) => state.user)
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks)
  const getCompletionPercent = useTaskStore((state) => state.getCompletionPercent)
  const todayLog = useTaskStore((state) => state.todayLog)
  const initTodayWorkout = useGymStore((state) => state.initTodayWorkout)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
    }
  }, [])

  const handleToast = (
    message: string, 
    variant: 'success' | 'error' = 'success',
    action?: () => void,
    actionLabel?: string
  ) => {
    // Clear any existing undo timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
    }

    setToast({ message, variant, action, actionLabel })
    
    // Auto-dismiss after 3 seconds if there's an action (undo), 2.2 seconds otherwise
    const duration = action ? 3000 : 2200
    undoTimerRef.current = window.setTimeout(() => {
      setToast(null)
      setPendingUndoTaskId(null)
    }, duration)
  }

  useEffect(() => {
    // Initialize today's tasks and check for gym
    if (!user) return
    const todayTasks = getTodayTasks()
    const hasGymTask = todayTasks.some((t) => t.type === 'gym')

    if (hasGymTask) {
      initTodayWorkout(user.id)
    }
  }, [user, getTodayTasks, initTodayWorkout]);

  const completionPercent = getCompletionPercent();
  
  // Calculate completed and total today's habits
  const todayTasks = getTodayTasks()
  const completedCount = todayTasks.filter((t) => todayLog[t.id]).length
  const totalCount = todayTasks.length

  return (
    <div className="min-h-screen bg-bg-primary pb-20 page-enter">
      {/* Header Section */}
      <div className="px-4 py-5 mb-4">
        <h1 className="font-display font-semibold text-2xl text-white">
          {getGreeting()}{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-text-secondary text-xs mt-1">{formatDate()}</p>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-3">
        {/* Blocker Banner */}
        <BlockerBanner />

        {/* Progress Bar */}
        <ProgressBar percent={completionPercent} completed={completedCount} total={totalCount} />

        {/* Stats Row */}
        <StatsRow />

        {/* Today's Routine Label */}
        <div className="pt-1">
          <h2 className="font-display font-semibold text-lg text-white mb-3 mt-5">
            Today's Routine
          </h2>
        </div>

        {/* Task List */}
        <TaskList onToast={handleToast} />
      </div>

      {toast && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md flex items-center justify-between ${
              toast.variant === 'success'
                ? 'border-[rgba(168,255,62,0.25)] bg-[#11150F] text-accent-lime'
                : 'border-[rgba(239,68,68,0.25)] bg-[#1A0F10] text-status-danger'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.action && toast.actionLabel && (
              <button
                onClick={() => {
                  if (undoTimerRef.current) {
                    clearTimeout(undoTimerRef.current)
                  }
                  toast.action?.()
                  setToast(null)
                  setPendingUndoTaskId(null)
                }}
                className="ml-4 text-xs font-semibold text-accent-lime hover:opacity-70 transition-opacity active:scale-95 whitespace-nowrap"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-accent-lime text-black flex items-center justify-center shadow-lg hover:shadow-2xl transition-shadow duration-200 active:scale-95 z-40"
        title="Add new task"
      >
        <Plus size={24} className="font-bold" />
      </button>

      {/* Add Task Sheet */}
      <AddTaskSheet open={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  )
}
