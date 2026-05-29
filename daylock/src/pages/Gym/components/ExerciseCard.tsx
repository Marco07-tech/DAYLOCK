'use client';

import { Plus, Check } from 'lucide-react';
import type { Exercise } from '../../../types';
import { useGymStore } from '../../../store/useGymStore';
import { cn } from '../../../lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const updateSet = useGymStore((state) => state.updateSet);
  const addSet = useGymStore((state) => state.addSet);

  const allSetsDone = exercise.sets.every((set) => set.done);

  return (
    <div className={cn('bg-bg-card border rounded-2xl p-4 transition-all', allSetsDone ? 'border-accent-lime border-opacity-40' : 'border-bg-border')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-semibold text-base font-display">{exercise.name}</h3>
        <span className="text-accent-lime bg-accent-lime-muted border border-accent-lime border-opacity-20 text-xs rounded-full px-2.5 py-0.5 font-medium">
          {exercise.muscleGroup}
        </span>
      </div>

      {/* Sets Table */}
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-1 pb-2 text-xs font-medium text-text-muted">
          <div className="col-span-2">Set</div>
          <div className="col-span-4">Weight (kg)</div>
          <div className="col-span-4">Reps</div>
          <div className="col-span-2 text-center">Done</div>
        </div>

        {/* Table Rows */}
        {exercise.sets.map((set, idx) => (
          <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 text-text-secondary text-xs">{idx + 1}</div>
            <input
              type="number"
              value={set.weight || ''}
              onChange={(e) =>
                updateSet(exercise.id, set.id, { weight: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              className="col-span-4 h-8 bg-bg-primary border border-bg-border rounded-lg px-2 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
            />
            <input
              type="number"
              value={set.reps || ''}
              onChange={(e) =>
                updateSet(exercise.id, set.id, { reps: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              className="col-span-4 h-8 bg-bg-primary border border-bg-border rounded-lg px-2 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
            />
            <button
              onClick={() => updateSet(exercise.id, set.id, { done: !set.done })}
              className={cn(
                'col-span-2 mx-auto w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150 transform hover:scale-110',
                set.done
                  ? 'bg-accent-lime border-accent-lime'
                  : 'border-bg-border hover:border-accent-lime bg-transparent'
              )}
            >
              {set.done && <Check size={14} className="text-black" strokeWidth={3} />}
            </button>
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <button
        onClick={() => addSet(exercise.id)}
        className="text-accent-lime text-xs font-medium mt-3 flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        <Plus size={13} />
        Add set
      </button>
    </div>
  );
}
