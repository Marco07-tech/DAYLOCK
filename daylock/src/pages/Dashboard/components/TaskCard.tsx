import { useState } from 'react'
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Task } from '../../../types/index'
import { useTaskStore } from '../../../store/useTaskStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/Button'
import { EditTaskModal } from './EditTaskModal'

interface TaskCardProps {
  task: Task
  onToast: (
    message: string, 
    variant?: 'success' | 'error',
    action?: () => void,
    actionLabel?: string
  ) => void
}

export function TaskCard({ task, onToast }: TaskCardProps) {
  const navigate = useNavigate()
  const toggleTaskDone = useTaskStore((state) => state.toggleTaskDone)
  const removeTask = useTaskStore((state) => state.removeTask)
  const todayLog = useTaskStore((state) => state.todayLog)
  const user = useAuthStore((state) => state.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const isDone = todayLog[task.id] || false
  const streak = task.streak
  const hasHighStreak = streak >= 7

  const handleDelete = async () => {
    if (!user || deleting) return

    setDeleting(true)
    const success = await removeTask(task.id, user.id)
    setDeleting(false)
    setShowDeleteConfirm(false)
    setMenuOpen(false)

    if (success) {
      onToast('Habit deleted successfully', 'success')
    } else {
      onToast('Failed to delete habit', 'error')
    }
  }

  return (
    <>
      <div
        className={cn(
          'relative bg-bg-card border border-bg-border rounded-2xl p-3.5 pl-4 pr-12 flex items-start gap-3',
          'border-l-2 transition-all duration-200 hover:border-bg-border',
          isDone ? 'border-l-transparent' : 'border-l-accent-lime border-l-opacity-25'
        )}
      >
        {/* Checkbox */}
        <button
          onClick={async () => {
            if (!user || toggling) return
            
            // Detect if this is a completion (not done → done)
            const isCompletion = !isDone
            
            // Prevent duplicate requests
            setToggling(true)
            try {
              // Toggle the task
              await toggleTaskDone(task.id, user.id)
              
              // Show undo toast only for completions
              if (isCompletion) {
                onToast(
                  'Habit completed ✓',
                  'success',
                  () => toggleTaskDone(task.id, user.id),
                  'UNDO'
                )
              }
            } finally {
              setToggling(false)
            }
          }}
          className={cn(
            'w-8 h-8 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center',
            'transition-all duration-200 active:scale-95',
            toggling && 'opacity-50 cursor-not-allowed',
            isDone
              ? 'bg-accent-lime border-accent-lime'
              : 'border-bg-border bg-transparent hover:border-bg-border'
          )}
          disabled={toggling}
        >
          {isDone && <Check size={16} className="text-black" />}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium',
              isDone ? 'text-text-muted line-through' : 'text-white'
            )}
          >
            {task.name}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {task.scheduledTime || 'No time set'} • {task.type}
          </p>

          {task.type === 'gym' && (
            <button
              onClick={() => navigate('/gym')}
              className="text-xs text-accent-lime hover:text-accent-lime-dark transition-colors mt-1"
            >
              Tap to log workout →
            </button>
          )}
        </div>

        {/* Streak Badge */}
        <div
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
            hasHighStreak
              ? 'bg-accent-lime-muted text-accent-lime border border-accent-lime border-opacity-20'
              : 'bg-bg-card text-text-secondary border border-bg-border'
          )}
        >
          {hasHighStreak && '🔥 '}
          {streak}d
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="absolute right-2 top-2 h-8 w-8 rounded-full border border-bg-border bg-bg-primary text-text-secondary flex items-center justify-center active:scale-95 transition-colors hover:border-accent-lime hover:text-white"
          aria-label="Habit menu"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-2 top-11 z-20 w-40 overflow-hidden rounded-2xl border border-bg-border bg-[#11131A] shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setShowEditModal(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-bg-card"
              >
                <Pencil size={14} className="text-text-secondary" />
                Edit Habit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setShowDeleteConfirm(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-status-danger transition-colors hover:bg-[rgba(239,68,68,0.1)]"
              >
                <Trash2 size={14} className="text-status-danger" />
                Delete Habit
              </button>
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-4 sm:items-center sm:pb-0">
          <div className="w-full max-w-sm rounded-3xl border border-bg-border bg-bg-secondary p-5 shadow-2xl">
            <h3 className="font-display text-xl text-white">Delete Habit?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              This will permanently remove this habit from your routine.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="w-full"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="w-full"
                isLoading={deleting}
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditTaskModal
        open={showEditModal}
        task={task}
        onClose={() => setShowEditModal(false)}
        onToast={onToast}
      />
    </>
  )
}
