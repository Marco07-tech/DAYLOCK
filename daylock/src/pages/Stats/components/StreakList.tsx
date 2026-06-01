import { Dumbbell, BookOpen, Droplet, Moon, Activity, Star } from 'lucide-react';
import { useTaskStore } from '../../../store/useTaskStore';
import type { TaskType } from '../../../types';
import { cn } from '../../../lib/utils';

const TASK_ICONS: Record<TaskType, React.ReactNode> = {
  gym: <Dumbbell size={18} className="text-accent-lime" />,
  study: <BookOpen size={18} className="text-accent-lime" />,
  water: <Droplet size={18} className="text-accent-lime" />,
  sleep: <Moon size={18} className="text-accent-lime" />,
  cardio: <Activity size={18} className="text-accent-lime" />,
  custom: <Star size={18} className="text-accent-lime" />,
};

export function StreakList() {
  const tasks = useTaskStore((state) => state.tasks);
  const streaks = useTaskStore((state) => state.streaks);

  if (tasks.length === 0) {
    return (
      <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-3 text-center">
        <p className="text-text-secondary text-sm">Complete habits daily to build</p>
        <p className="text-text-muted text-xs mt-1">amazing streaks! 🔥</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-3">
      <p className="text-text-primary text-sm font-medium mb-3">Habit Streaks</p>

      <div className="space-y-2.5">
        {tasks.map((task, idx) => {
          const streak = streaks[task.id] || 0;
          const fillPercent = Math.min((streak / 30) * 100, 100);

          let barColor = '#EF4444';
          if (streak >= 7) barColor = '#A8FF3E';
          else if (streak >= 3) barColor = '#F59E0B';

          return (
            <div key={task.id}>
              <div
                className={cn(
                  'flex items-center justify-between py-2.5',
                  idx < tasks.length - 1 && 'border-b border-bg-border'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {TASK_ICONS[task.type]}
                  <span className="text-text-primary text-xs">{task.name}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    streak > 0 ? 'text-accent-lime font-semibold' : 'text-text-secondary'
                  )}
                >
                  {streak > 0 ? `🔥 ${streak} days` : `${streak} days`}
                </span>
              </div>
              <div className="h-0.5 bg-bg-border rounded-full overflow-hidden">
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
