import { useTaskStore } from '../../../store/useTaskStore';

export function BlockerBanner() {
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const todayLog = useTaskStore((state) => state.todayLog);
  const todayTasks = getTodayTasks();

  if (todayTasks.length === 0) {
    return (
      <div className="mb-3 bg-bg-card border border-bg-border rounded-2xl p-3.5 px-4">
        <p className="text-text-secondary text-sm">Add your first habit to get started</p>
      </div>
    );
  }

  const tasksRemaining = todayTasks.filter((t) => !todayLog[t.id]).length;
  const isUnlocked = tasksRemaining === 0;

  if (isUnlocked) {
    return (
      <div className="mb-3 bg-accent-lime-muted border border-accent-lime border-opacity-25 rounded-2xl p-3.5 px-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-accent-lime flex-shrink-0 mt-0.5">lock_open</span>
        <div>
          <p className="text-accent-lime font-medium text-sm">Day Complete! Streak extended 🔥</p>
          <p className="text-accent-lime text-xs opacity-60 mt-0.5">
            All habits locked in. See you tomorrow!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 bg-bg-card border border-status-warning border-opacity-25 rounded-2xl p-3.5 px-4 flex items-start gap-3">
      <span className="material-symbols-outlined text-status-warning flex-shrink-0 mt-0.5 animate-pulse">lock</span>
      <div>
        <p className="text-status-warning font-medium text-sm">
          {tasksRemaining} task{tasksRemaining !== 1 ? 's' : ''} remaining — day is locked
        </p>
        <p className="text-status-warning text-xs opacity-60 mt-0.5">
          Complete all habits to unlock your day
        </p>
      </div>
    </div>
  );
}
