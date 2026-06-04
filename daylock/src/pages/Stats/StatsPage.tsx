import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { WeeklyChart } from './components/WeeklyChart';
import { StreakList } from './components/StreakList';
import { HeatmapGrid } from './components/HeatmapGrid';

export function StatsPage() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const streaks = useTaskStore((state) => state.streaks);
  const loadDailyLogs = useTaskStore((state) => state.loadDailyLogs);

  useEffect(() => {
    if (user?.id) {
      void loadDailyLogs(user.id);
    }
  }, [user?.id, loadDailyLogs]);

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 page-enter flex flex-col items-center justify-center px-4">
        <span className="material-symbols-outlined text-[48px] text-text-muted mb-4 opacity-50">bar_chart</span>
        <h2 className="text-text-primary font-semibold text-lg mb-2">No data yet</h2>
        <p className="text-text-secondary text-sm text-center mb-6 max-w-xs">
          Track habits daily to unlock your stats, streaks, and activity heatmap.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="w-full">
          Go to Dashboard →
        </Button>
      </div>
    );
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + mondayOffset + weekOffset * 7);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatWeekDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const weekRange = `${formatWeekDate(startOfWeek)} - ${formatWeekDate(endOfWeek)}`;

  const bestDay = tasks.reduce(
    (best, task) => {
      const streak = streaks[task.id] || 0;
      return streak > (streaks[best?.id] || 0) ? task : best;
    },
    tasks[0]
  );

  return (
    <div className="min-h-screen bg-background pb-20 page-enter">
      <div className="px-4 py-5 max-w-md mx-auto">
        <h1 className="text-text-primary text-2xl font-semibold mb-5">Statistics</h1>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-8 h-8 rounded-full bg-bg-card border border-bg-border text-text-primary hover:border-accent-lime transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <p className="text-text-primary text-sm font-medium">{weekRange}</p>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset === 0}
            className={cn(
              'w-8 h-8 rounded-full border text-text-primary transition-all flex items-center justify-center',
              weekOffset === 0
                ? 'bg-bg-border border-bg-border opacity-50 cursor-not-allowed'
                : 'bg-bg-card border-bg-border hover:border-accent-lime'
            )}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        <WeeklyChart weekOffset={weekOffset} />

        {bestDay && (
          <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-3">
            <p className="text-text-secondary text-xs mb-2 font-medium">BEST STREAK</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-text-primary font-semibold text-sm">{bestDay.name}</p>
                <p className="text-accent-lime text-xs font-medium">
                  🔥 {streaks[bestDay.id] || 0} day streak
                </p>
              </div>
            </div>
          </div>
        )}

        <StreakList />
        <HeatmapGrid />
      </div>
    </div>
  );
}
