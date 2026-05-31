import { useGymStore } from '../../../store/useGymStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { getDayName } from '../../../lib/utils';
import { cn } from '../../../lib/utils';
import type { GymSplit } from '../../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SPLITS: GymSplit[] = ['Push', 'Pull', 'Legs', 'Full Body', 'Rest'];

export function MySplit() {
  const weeklySplit = useGymStore((state) => state.weeklySplit);
  const updateWeeklySplit = useGymStore((state) => state.updateWeeklySplit);
  const user = useAuthStore((state) => state.user);

  const today = getDayName();

  return (
    <div className="px-4 py-4">
      <p className="text-text-secondary text-xs mb-4">Customize your weekly workout schedule</p>

      <div className="space-y-2">
        {DAYS.map((day) => {
          const isToday = day === today;
          const split = weeklySplit[day as keyof typeof weeklySplit] || 'Rest';

          return (
            <div
              key={day}
              className={cn(
                'bg-bg-card border rounded-2xl p-3.5 transition-all',
                isToday ? 'border-accent-lime border-opacity-40' : 'border-bg-border'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-text-primary font-semibold text-sm font-display">{day}</h4>
                {isToday && (
                  <span className="text-accent-lime bg-accent-lime-muted border border-accent-lime border-opacity-20 text-xs rounded-full px-2 py-0.5 font-medium">
                    Today
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SPLITS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (!user) return
                      updateWeeklySplit(day, s, user.id)
                    }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                      split === s
                        ? 'bg-accent-lime text-black'
                        : 'bg-bg-primary border border-bg-border text-text-secondary hover:border-accent-lime'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
