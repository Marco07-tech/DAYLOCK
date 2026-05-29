'use client';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DUMMY_DATA = { Mon: 80, Tue: 60, Wed: 100, Thu: 40, Fri: 0, Sat: 0, Sun: 0 };

interface WeeklyChartProps {
  weekOffset: number;
}

export function WeeklyChart({ weekOffset }: WeeklyChartProps) {
  const isCurrentWeek = weekOffset === 0;
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-3">
      <p className="text-text-primary text-sm font-medium mb-3">Weekly Overview</p>

      <div className="flex items-flex-end gap-2 h-32 justify-between">
        {DAYS.map((day, idx) => {
          const percentage = DUMMY_DATA[day as keyof typeof DUMMY_DATA];
          const isToday = isCurrentWeek && idx === todayIndex;
          const isFuture = isCurrentWeek && idx > todayIndex;
          const height = Math.max(4, (percentage / 100) * 100);

          let bgColor = '#1A1A24';
          if (isToday) bgColor = '#A8FF3E';
          else if (!isFuture && percentage > 0) bgColor = 'rgba(168, 255, 62, 0.4)';

          return (
            <div key={day} className="flex flex-col items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 h-24">
                {percentage > 0 && (
                  <span className="text-xs text-text-muted h-4">{percentage}%</span>
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
                className={`text-xs mt-2 ${
                  isToday
                    ? 'text-accent-lime font-semibold'
                    : 'text-text-secondary'
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
