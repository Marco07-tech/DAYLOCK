import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'

interface WeeklyChartProps {
  data: { day: string; volume: number; active: boolean; isToday?: boolean }[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Weekly Activity</h3>
        <span className="text-xs text-[var(--color-muted)]">This week</span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} barSize={24} barGap={4}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 11, fontWeight: 500 }}
          />
          <Bar dataKey="volume" radius={[6, 6, 6, 6]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isToday ? 'var(--color-primary)' : entry.active ? '#3f3f46' : '#27272a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
