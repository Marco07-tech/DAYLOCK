import { useMemo } from 'react';
import { useTaskStore } from '../../../store/useTaskStore';

const WEEK_LABELS = ['4w', '3w', '2w', '1w', 'This'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getHeatmapColor(percentage: number): string {
  if (percentage === 0) return '#e5e2e1';
  if (percentage <= 40) return 'rgba(81, 96, 81, 0.2)';
  if (percentage <= 70) return 'rgba(81, 96, 81, 0.4)';
  if (percentage < 100) return 'rgba(81, 96, 81, 0.6)';
  return '#516051';
}

export function HeatmapGrid() {
  const dailyLogs = useTaskStore((state) => state.dailyLogs);

  const { weeks, logByDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: { date: Date; iso: string }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const iso = date.toISOString().split('T')[0];
      cells.push({ date, iso });
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
    <div className="bg-surface-container-low card-shadow rounded-[24px] p-6 mb-3">
      <p className="font-label-md text-label-md text-on-surface mb-3">30-Day Activity</p>

      <div className="flex gap-1 mb-3">
        <div className="w-7" />
        {DAY_LABELS.map((day, i) => (
          <div key={`${day}-${i}`} className="w-7 h-7 flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant">
            {day}
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-3">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 items-center">
            <div className="w-7 text-right font-label-sm text-label-sm text-on-surface-variant">{WEEK_LABELS[weekIdx]}</div>
            {week.map((cell) => {
              const completion = logByDate.get(cell.iso) ?? 0;
              return (
                <div
                  key={cell.iso}
                  className="w-7 h-7 rounded-md transition-all hover:ring-2 hover:ring-primary cursor-pointer"
                  style={{ backgroundColor: getHeatmapColor(completion) }}
                  title={`${cell.date.toDateString()} - ${completion}% complete`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Less</span>
        <div className="flex gap-1">
          {['#e5e2e1', 'rgba(81, 96, 81, 0.2)', 'rgba(81, 96, 81, 0.6)', '#516051'].map(
            (color, idx) => (
              <div key={idx} className="w-2.5 h-2.5 rounded" style={{ backgroundColor: color }} />
            )
          )}
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">More</span>
      </div>
    </div>
  );
}
