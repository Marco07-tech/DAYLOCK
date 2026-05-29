import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Task } from '../../../types/index'
import { useTaskStore } from '../../../store/useTaskStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { cn } from '../../../lib/utils'

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
  const toggleTaskDone = useTaskStore((state) => state.toggleTaskDone)
  const todayLog = useTaskStore((state) => state.todayLog)
  const user = useAuthStore((state) => state.user)

  const isDone = todayLog[task.id] || false;
  const streak = task.streak;
  const hasHighStreak = streak >= 7;

  return (
    <div
      className={cn(
        'bg-bg-card border border-bg-border rounded-2xl p-3.5 px-4 flex items-start gap-3',
        'border-l-2 transition-all duration-200 hover:border-bg-border',
        isDone ? 'border-l-transparent' : 'border-l-accent-lime border-l-opacity-25'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={async () => {
          if (!user) return
          await toggleTaskDone(task.id, user.id)
        }}
        className={cn(
          'w-8 h-8 rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center',
          'transition-all duration-200 active:scale-95',
          isDone
            ? 'bg-accent-lime border-accent-lime'
            : 'border-bg-border bg-transparent hover:border-bg-border'
        )}
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
    </div>
  );
}
