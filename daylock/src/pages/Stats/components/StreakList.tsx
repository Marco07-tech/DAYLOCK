import { useTaskStore } from '../../../store/useTaskStore';
import type { TaskType } from '../../../types';
import { cn } from '../../../lib/utils';

const TASK_ICONS: Record<TaskType, string> = {
  gym: 'fitness_center',
  study: 'menu_book',
  water: 'water_drop',
  sleep: 'bedtime',
  cardio: 'directions_run',
  steps: 'directions_walk',
  custom: 'star',
};

export function StreakList() {
  const tasks = useTaskStore((state) => state.tasks);
  const streaks = useTaskStore((state) => state.streaks);

  if (tasks.length === 0) {
    return (
      <div className="bg-surface-container-low card-shadow rounded-[24px] p-6 mb-3 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">Complete habits daily to build</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">amazing streaks!</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low card-shadow rounded-[24px] p-6 mb-3">
      <p className="font-label-md text-label-md text-on-surface mb-3">Habit Streaks</p>

      <div className="space-y-2.5">
        {tasks.map((task, idx) => {
          const streak = streaks[task.id] || 0;
          const fillPercent = Math.min((streak / 30) * 100, 100);

          let barColor = '#ba1a1a';
          if (streak >= 7) barColor = '#516051';
          else if (streak >= 3) barColor = '#c99f2e';

          return (
            <div key={task.id}>
              <div
                className={cn(
                  'flex items-center justify-between py-2.5',
                  idx < tasks.length - 1 && 'border-b border-outline-variant/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">{TASK_ICONS[task.type]}</span>
                  <span className="font-label-sm text-label-sm text-on-surface">{task.name}</span>
                </div>
                <span
                  className={cn(
                    'font-label-sm text-label-sm',
                    streak > 0 ? 'text-primary font-semibold' : 'text-on-surface-variant'
                  )}
                >
                  {streak > 0 ? `${streak} days` : `${streak} days`}
                </span>
              </div>
              <div className="h-0.5 bg-surface-variant rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${fillPercent}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
