import { useTaskStore } from '../../../store/useTaskStore'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  onToast: (
    message: string, 
    variant?: 'success' | 'error',
    action?: () => void,
    actionLabel?: string
  ) => void
}

export function TaskList({ onToast }: TaskListProps) {
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks)
  const todayTasks = getTodayTasks()

  if (todayTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-secondary text-sm">Create your first habit to start</p>
        <p className="text-text-muted text-xs mt-1">building consistency. 💪</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todayTasks.map((task) => (
        <TaskCard key={task.id} task={task} onToast={onToast} />
      ))}
    </div>
  )
}
