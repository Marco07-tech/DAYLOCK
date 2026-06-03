import { useState, useCallback } from 'react';
import { useGymStore } from '../../../store/useGymStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { getDayName } from '../../../lib/utils';
import { cn } from '../../../lib/utils';
import type { GymSplit } from '../../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SPLITS: GymSplit[] = ['Push', 'Pull', 'Legs', 'Full Body', 'Rest'];

const SPLIT_ICONS: Record<GymSplit, string> = {
  Push: 'fitness_center',
  Pull: 'fitness_center',
  Legs: 'fitness_center',
  'Full Body': 'fitness_center',
  Rest: 'bedtime',
};

const MUSCLE_TAGS: Record<GymSplit, string[]> = {
  Push: ['Chest', 'Shoulders', 'Triceps'],
  Pull: ['Back', 'Biceps'],
  Legs: ['Quads', 'Hamstrings', 'Glutes'],
  'Full Body': ['Full Body'],
  Rest: [],
};

function getDayStatus(day: string, today: string) {
  const dayIndex = DAYS.indexOf(day);
  const todayIndex = DAYS.indexOf(today);
  if (day === today) return 'today';
  if (dayIndex < todayIndex) return 'past';
  return 'future';
}

function FlashOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 bg-primary-fixed-dim/10 pointer-events-none rounded-lg" />
  );
}

function DayRow({
  day,
  today,
  split,
  completedSetsCount,
}: {
  day: string;
  today: string;
  split: GymSplit;
  completedSetsCount: number;
}) {
  const updateWeeklySplit = useGymStore((state) => state.updateWeeklySplit);
  const user = useAuthStore((state) => state.user);
  const [flash, setFlash] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const status = getDayStatus(day, today);
  const isRest = split === 'Rest';
  const isToday = status === 'today';

  const handleClick = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    if (isToday) {
      setShowPicker((p) => !p);
    }
  }, [isToday]);

  return (
    <div
      className={cn(
        'relative grid grid-cols-12 items-center px-stack-sm py-4 border-b border-outline-variant/30 cursor-pointer hover:bg-surface-variant transition-colors',
        isToday && 'bg-primary-fixed-dim/5 py-5'
      )}
      style={isToday ? { boxShadow: '0 0 20px rgba(171,214,0,0.15)' } : {}}
      onClick={handleClick}
    >
      {/* Flash overlay */}
      <FlashOverlay show={flash} />

      {/* Day name */}
      <div className="col-span-3 relative z-10 flex items-center gap-1 min-w-0">
        {isToday && (
          <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-fixed-dim rounded-r-full" />
        )}
        <span className={cn('font-label-md truncate', isToday && 'text-primary-fixed-dim font-bold')}>
          {day}
        </span>
        {isToday && (
          <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-primary-fixed-dim text-on-primary-fixed font-bold uppercase text-[10px]">
            Today
          </span>
        )}
      </div>

      {/* Workout type */}
      <div className="col-span-6 flex items-center gap-2 relative z-10">
        <span className={cn('material-symbols-outlined', isToday ? 'text-primary-fixed-dim' : 'text-on-tertiary-container')}
          style={{ fontSize: '18px' }}>
          {SPLIT_ICONS[split]}
        </span>
        <span className={cn('text-sm', isRest ? 'text-secondary' : 'text-on-surface')}>
          {isRest ? 'Rest Day' : split}
        </span>
        {!isRest && status === 'past' && (
          <div className="flex gap-1">
            {MUSCLE_TAGS[split].slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-[2px] bg-secondary-container text-[10px] text-secondary-fixed-dim font-bold uppercase tracking-tighter"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="col-span-3 flex justify-end relative z-10">
        {isRest ? (
          <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontSize: '18px' }}>
            remove_circle_outline
          </span>
        ) : isToday ? (
          <button
            onClick={(e) => { e.stopPropagation(); setShowPicker((p) => !p); }}
            className="bg-primary-fixed-dim text-on-primary-fixed px-3 py-1 rounded-md font-bold text-xs active:scale-95 transition-all"
          >
            START
          </button>
        ) : status === 'past' && completedSetsCount > 0 ? (
          <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        ) : status === 'future' ? (
          <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontSize: '18px' }}>
            radio_button_unchecked
          </span>
        ) : (
          <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontSize: '18px' }}>
            radio_button_unchecked
          </span>
        )}
      </div>

      {/* Split picker (only on today click) */}
      {showPicker && isToday && (
        <div className="col-span-12 mt-3 flex flex-wrap gap-1.5 relative z-10" onClick={(e) => e.stopPropagation()}>
          {SPLITS.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (user) {
                  updateWeeklySplit(day, s, user.id);
                  setShowPicker(false);
                }
              }}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                split === s
                  ? 'bg-primary-fixed-dim text-on-primary-fixed'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:border-primary-fixed-dim'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MySplit() {
  const weeklySplit = useGymStore((state) => state.weeklySplit);
  const todayWorkout = useGymStore((state) => state.todayWorkout);

  const today = getDayName();

  // Count completed sets for each split (placeholder — real tracking would need historical data)
  const completedSetsByDay = DAYS.reduce<Record<string, number>>((acc, day) => {
    acc[day] = day === today ? (todayWorkout?.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0) || 0) : 0;
    return acc;
  }, {});

  const streak = todayWorkout?.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0) || 0;
  const streakDays = Math.min(Math.floor(streak / 5), 30); // simplified streak display

  return (
    <div className="space-y-6">
      {/* Split table */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-stack-sm py-3 bg-surface-container-high/50 border-b border-outline-variant">
          <span className="col-span-3 font-label-sm text-on-tertiary-container uppercase">DAY</span>
          <span className="col-span-6 font-label-sm text-on-tertiary-container uppercase">WORKOUT</span>
          <span className="col-span-3 font-label-sm text-on-tertiary-container uppercase text-right">STATUS</span>
        </div>

        {/* Day rows */}
        {DAYS.map((day) => {
          const split = weeklySplit[day as keyof typeof weeklySplit] || 'Rest';
          return (
            <DayRow
              key={day}
              day={day}
              today={today}
              split={split as GymSplit}
              completedSetsCount={completedSetsByDay[day]}
            />
          );
        })}
      </div>

      {/* Consistency streak card */}
      <div className="relative rounded-xl bg-surface-container-high border border-outline-variant p-stack-sm overflow-hidden">
        {/* Lime blur glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-fixed-dim/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <p className="font-label-sm text-primary-fixed-dim uppercase tracking-widest mb-2">
            CONSISTENCY STREAK
          </p>
          <p className="font-display text-headline-lg text-primary">{streakDays}</p>
          <p className="font-body-md text-secondary mt-0.5">Days Active</p>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface-container-lowest rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-primary-fixed-dim rounded-full transition-all duration-500"
              style={{ width: `${Math.min((streakDays / 30) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
