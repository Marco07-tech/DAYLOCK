import { useMemo } from 'react';
import { useTaskStore } from '../../../store/useTaskStore';

const WEEK_LABELS = ['4w', '3w', '2w', '1w', 'This'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getHeatmapColor(percentage: number): string {
  if (percentage === 0) return '#2A2A35';
  if (percentage <= 40) return 'rgba(168, 255, 62, 0.2)';
  if (percentage <= 70) return 'rgba(168, 255, 62, 0.4)';
  if (percentage < 100) return 'rgba(168, 255, 62, 0.6)';
  return '#A8FF3E';
}

export function HeatmapGrid() {
  const dailyLogs = useTaskStore((state) => state.dailyLogs);

  const { weeks, logByDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: { date: Date; iso: string; completion: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const iso = date.toISOString().split('T')[0];
      cells.push({ date, iso, completion: 0 });
    }

    const map = new Map<string, number>();
    for (const log of dailyLogs) {
      map.set(log.date, log.completion_percent);
    }

    const filled = cells.map((cell) => ({
      ...cell,
      completion: map.get(cell.iso) ?? 0,
    }));

    const weekRows: (typeof filled)[] = [];
    for (let i = 0; i < 5; i++) {
      weekRows.push(filled.slice(i * 7, (i + 1) * 7));
    }

    return { weeks: weekRows, logByDate: map };
  }, [dailyLogs]);

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-3">
      <p className="text-text-primary text-sm font-medium mb-3">30-Day Activity</p>

      <div className="flex gap-1 mb-3">
        <div className="w-7" />
        {DAY_LABELS.map((day, i) => (
          <div key={`${day}-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-text-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-3">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 items-center">
            <div className="w-7 text-right text-xs text-text-muted">{WEEK_LABELS[weekIdx]}</div>
            {week.map((cell) => {
              const completion = logByDate.get(cell.iso) ?? cell.completion;
              return (
                <div
                  key={cell.iso}
                  className="w-7 h-7 rounded-md transition-all hover:ring-2 hover:ring-accent-lime cursor-pointer"
                  style={{ backgroundColor: getHeatmapColor(completion) }}
                  title={`${cell.date.toDateString()} - ${completion}% complete`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-text-secondary">Less</span>
        <div className="flex gap-1">
          {['#2A2A35', 'rgba(168, 255, 62, 0.2)', 'rgba(168, 255, 62, 0.4)', '#A8FF3E'].map(
            (color, idx) => (
              <div key={idx} className="w-2.5 h-2.5 rounded" style={{ backgroundColor: color }} />
            )
          )}
        </div>
        <span className="text-xs text-text-secondary">More</span>
      </div>
    </div>
  );
}
