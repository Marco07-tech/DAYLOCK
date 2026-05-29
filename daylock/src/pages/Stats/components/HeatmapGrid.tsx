'use client';

interface Cell {
  date: Date;
  completion: number;
}

const WEEK_LABELS = ['4w', '3w', '2w', '1w', 'This'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function generateDummyData(): Cell[] {
  const cells: Cell[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const isTodayOrFuture = date >= today;
    const completion = isTodayOrFuture ? 0 : Math.floor(Math.random() * 101);

    cells.push({ date, completion });
  }

  return cells;
}

function getHeatmapColor(percentage: number): string {
  if (percentage === 0) return '#2A2A35';
  if (percentage <= 40) return 'rgba(168, 255, 62, 0.2)';
  if (percentage <= 70) return 'rgba(168, 255, 62, 0.4)';
  if (percentage < 100) return 'rgba(168, 255, 62, 0.6)';
  return '#A8FF3E';
}

export function HeatmapGrid() {
  const data = generateDummyData();

  // Organize data into 5 rows of 7 columns
  const weeks: Cell[][] = [];
  for (let i = 0; i < 5; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-4 mb-3">
      <p className="text-text-primary text-sm font-medium mb-3">30-Day Activity</p>

      {/* Day labels */}
      <div className="flex gap-1 mb-3">
        <div className="w-7" />
        {DAY_LABELS.map((day) => (
          <div key={day} className="w-7 h-7 flex items-center justify-center text-xs text-text-muted">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-1 mb-3">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 items-center">
            <div className="w-7 text-right text-xs text-text-muted">
              {WEEK_LABELS[weekIdx]}
            </div>
            {week.map((cell) => (
              <div
                key={cell.date.toISOString()}
                className="w-7 h-7 rounded-md transition-all hover:ring-2 hover:ring-accent-lime cursor-pointer"
                style={{ backgroundColor: getHeatmapColor(cell.completion) }}
                title={`${cell.date.toDateString()} - ${cell.completion}% complete`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-text-secondary">Less</span>
        <div className="flex gap-1">
          {['#2A2A35', 'rgba(168, 255, 62, 0.2)', 'rgba(168, 255, 62, 0.4)', '#A8FF3E'].map(
            (color, idx) => (
              <div
                key={idx}
                className="w-2.5 h-2.5 rounded"
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>
        <span className="text-xs text-text-secondary">More</span>
      </div>
    </div>
  );
}
