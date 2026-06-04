import { useMemo } from 'react';
import { useTaskStore } from '../../../store/useTaskStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeeklyChartProps {
  weekOffset: number;
}

function getMondayOfWeek(base: Date, weekOffset: number): Date {
  const d = new Date(base);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset + weekOffset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function WeeklyChart({ weekOffset }: WeeklyChartProps) {
  const dailyLogs = useTaskStore((state) => state.dailyLogs);

  const { weekDays, isCurrentWeek, todayIndex } = useMemo(() => {
    const monday = getMondayOfWeek(new Date(), weekOffset);
    const days: { label: string; iso: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({ label: DAYS[i], iso: toIsoDate(date) });
    }

    const todayIso = toIsoDate(new Date());
    const todayIdx = days.findIndex((d) => d.iso === todayIso);

    return {
      weekDays: days,
      isCurrentWeek: weekOffset === 0,
      todayIndex: todayIdx,
    };
  }, [weekOffset]);

  const logByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of dailyLogs) {
      map.set(log.date, log.completion_percent);
    }
    return map;
  }, [dailyLogs]);

  return (
    <div className="bg-surface-container-low card-shadow rounded-[24px] p-6 mb-3">
      <p className="font-label-md text-label-md text-on-surface mb-3">Weekly Overview</p>

      <div className="flex items-end gap-2 h-32 justify-between">
        {weekDays.map((day, idx) => {
          const percentage = logByDate.get(day.iso) ?? 0;
          const isToday = isCurrentWeek && idx === todayIndex;
          const isFuture = isCurrentWeek && todayIndex >= 0 && idx > todayIndex;
          const height = Math.max(4, percentage);

          let bgColor = '#c4c8c0';
          if (isToday) bgColor = '#516051';
          else if (!isFuture && percentage > 0) bgColor = 'rgba(81, 96, 81, 0.4)';

          return (
            <div key={day.iso} className="flex flex-col items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 h-24">
                {percentage > 0 && (
                  <span className="font-label-sm text-label-sm text-on-surface-variant h-4">{percentage}%</span>
                )}
                <div
                  className="transition-all duration-500 rounded-t"
                  style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: `${height}%`,
                    backgroundColor: bgColor,
                  }}
                />
              </div>
              <span
                className={`font-label-sm text-label-sm mt-2 ${
                  isToday ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
