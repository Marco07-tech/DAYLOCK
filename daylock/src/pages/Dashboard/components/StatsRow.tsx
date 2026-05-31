import { useTaskStore } from '../../../store/useTaskStore';

export function StatsRow() {
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const todayLog = useTaskStore((state) => state.todayLog);
  const streaks = useTaskStore((state) => state.streaks);

  const todayTasks = getTodayTasks();
  const done = todayTasks.filter((t) => todayLog[t.id]).length;
  const total = todayTasks.length;
  const bestStreak =
    todayTasks.length > 0
      ? Math.max(...todayTasks.map((t) => streaks[t.id] || 0), 0)
      : 0;
  const completion = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      <div className="bg-bg-card border border-bg-border rounded-2xl p-3 text-center">
        <p className="font-display font-semibold text-white text-2xl">
          {total === 0 ? '—' : `${done}/${total}`}
        </p>
        <p className="text-xs text-text-secondary mt-1">Today</p>
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-3 text-center">
        <p
          className={`font-display font-semibold text-2xl ${bestStreak > 0 ? 'text-accent-lime' : 'text-white'}`}
        >
          {total === 0 ? '—' : `🔥 ${bestStreak}`}
        </p>
        <p className="text-xs text-text-secondary mt-1">Best Streak</p>
      </div>

      <div className="bg-bg-card border border-bg-border rounded-2xl p-3 text-center">
        <p className="font-display font-semibold text-white text-2xl">
          {total === 0 ? '—' : `${completion}%`}
        </p>
        <p className="text-xs text-text-secondary mt-1">Completion</p>
      </div>
    </div>
  );
}
