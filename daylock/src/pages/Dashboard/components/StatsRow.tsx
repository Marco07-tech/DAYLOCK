import { useTaskStore } from '../../../store/useTaskStore';

export function StatsRow() {
  const tasks = useTaskStore((state) => state.tasks);
  const todayLog = useTaskStore((state) => state.todayLog);
  const streaks = useTaskStore((state) => state.streaks);

  const done = tasks.filter((t) => todayLog[t.id]).length;
  const total = tasks.length;
  const bestStreak = Math.max(...Object.values(streaks), 0);
  const completion = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      {/* Tasks Done */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-3 text-center">
        <p className="font-display font-semibold text-white text-2xl">
          {total === 0 ? '—' : `${done}/${total}`}
        </p>
        <p className="text-xs text-text-secondary mt-1">Today</p>
      </div>

      {/* Best Streak */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-3 text-center">
        <p className={`font-display font-semibold text-2xl ${bestStreak > 0 ? 'text-accent-lime' : 'text-white'}`}>
          {total === 0 ? '—' : `🔥 ${bestStreak}`}
        </p>
        <p className="text-xs text-text-secondary mt-1">Best Streak</p>
      </div>

      {/* Completion */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-3 text-center">
        <p className="font-display font-semibold text-white text-2xl">
          {total === 0 ? '—' : `${completion}%`}
        </p>
        <p className="text-xs text-text-secondary mt-1">Completion</p>
      </div>
    </div>
  );
}
