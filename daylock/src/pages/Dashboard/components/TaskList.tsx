import { useTaskStore } from '../../../store/useTaskStore'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  onToast: (message: string, variant?: 'success' | 'error') => void
}

export function TaskList({ onToast }: TaskListProps) {
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks)
  const todayTasks = getTodayTasks()

  if (todayTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-text-secondary text-sm">No habits yet</p>
        <p className="text-text-muted text-xs mt-1">Add your first habit</p>
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
