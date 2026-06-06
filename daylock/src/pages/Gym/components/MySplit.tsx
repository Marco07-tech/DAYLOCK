import { useState } from 'react';
import { useGymStore } from '../../../store/useGymStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { getDayName } from '../../../lib/utils';
import { cn } from '../../../lib/utils';
import type { GymSplit } from '../../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SPLITS: GymSplit[] = ['Push', 'Pull', 'Legs', 'Full Body', 'Rest'];

function getDayStatus(day: string, today: string) {
  const dayIndex = DAYS.indexOf(day);
  const todayIndex = DAYS.indexOf(today);
  if (day === today) return 'today';
  if (dayIndex < todayIndex) return 'past';
  return 'future';
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
  const [showPicker, setShowPicker] = useState(false);

  const status = getDayStatus(day, today);
  const isRest = split === 'Rest';
  const isToday = status === 'today';
  const isCompleted = status === 'past' && completedSetsCount > 0;

  const workoutIcon = isRest ? 'bedtime' : 'fitness_center';
  const workoutName = isRest ? 'Rest Day' : split;

  return (
    <div className={cn(
      'flex items-center px-5 py-4 border-b border-[#F0EDEA] transition-colors',
      isToday ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-[#F8F6F3]'
    )}>
      {/* Day name */}
      <span className={cn(
        'w-10 font-label-md text-label-md',
        isToday ? 'text-primary font-bold' : 'text-on-surface-variant'
      )}>
        {day.slice(0, 3)}
      </span>

      {/* Workout type */}
      <div className="flex-1 flex items-center gap-3 ml-2">
        <span className={cn(
          'material-symbols-outlined text-[20px]',
          isToday ? 'text-primary' : 'text-outline'
        )}>
          {workoutIcon}
        </span>
        <span className={cn(
          'font-body-md text-body-md',
          isCompleted ? 'text-on-surface-variant line-through opacity-50' :
          isToday ? 'text-primary font-semibold' :
          isRest ? 'text-on-surface-variant italic opacity-60' :
          'text-on-surface'
        )}>
          {workoutName}
        </span>

        {isToday && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary text-on-primary">
            TODAY
          </span>
        )}
      </div>

      {/* Right side status */}
      <div className="ml-auto">
        {isToday ? (
          <button className="bg-primary text-on-primary px-4 py-1.5 rounded-full font-label-sm text-label-sm active:scale-95 transition-all shadow-sm">
            Start
          </button>
        ) : isCompleted ? (
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        ) : isRest ? (
          <span className="material-symbols-outlined text-outline-variant text-[20px]">bedtime</span>
        ) : (
          <span className="material-symbols-outlined text-outline-variant text-[20px]">radio_button_unchecked</span>
        )}
      </div>

      {/* Split picker (only on today click) */}
      {showPicker && isToday && (
        <div className="absolute left-5 right-5 top-full mt-2 flex flex-wrap gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
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
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:border-primary'
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

  const completedSetsByDay = DAYS.reduce<Record<string, number>>((acc, day) => {
    acc[day] = day === today ? (todayWorkout?.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0) || 0) : 0;
    return acc;
  }, {});

  const exercisesDone = todayWorkout?.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0) || 0;
  const totalSets = todayWorkout?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) || 0;
  const streakDays = totalSets > 0 ? Math.min(Math.floor((exercisesDone / Math.max(totalSets, 1)) * 30), 30) : 0;

  return (
    <div className="space-y-6">
      {/* Split table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E0DDD8] shadow-[0_4px_20px_rgba(26,26,26,0.06)]">
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
      <div className="bg-white rounded-2xl p-6 border border-[#E0DDD8] shadow-[0_4px_20px_rgba(26,26,26,0.06)]">
        <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-1">Consistency Streak</p>
        <p className="font-[Literata] text-[36px] text-on-surface leading-none">{streakDays} Days Active</p>
        <div className="h-1 bg-[#F0EDEA] rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min((streakDays / 30) * 100, 100)}%` }} />
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 mt-2">
          You're in the top 5% of active members this month.
        </p>
      </div>
    </div>
  );
}
