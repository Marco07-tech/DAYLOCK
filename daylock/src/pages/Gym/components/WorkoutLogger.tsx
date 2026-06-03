import { useState, useEffect, useCallback } from 'react';
import { useGymStore } from '../../../store/useGymStore';
import type { Exercise, Set } from '../../../types';
import { cn } from '../../../lib/utils';

function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SetRow({ exercise, set, index }: { exercise: Exercise; set: Set; index: number }) {
  const updateSet = useGymStore((state) => state.updateSet);

  const [weightText, setWeightText] = useState(String(set.weight || ''));
  const [repsText, setRepsText] = useState(String(set.reps || ''));

  useEffect(() => {
    setWeightText(String(set.weight || ''));
    setRepsText(String(set.reps || ''));
  }, [set.weight, set.reps]);

  const handleWeightBlur = useCallback(() => {
    const val = parseFloat(weightText) || 0;
    updateSet(exercise.id, set.id, { weight: val });
  }, [exercise.id, set.id, weightText, updateSet]);

  const handleRepsBlur = useCallback(() => {
    const val = parseFloat(repsText) || 0;
    updateSet(exercise.id, set.id, { reps: val });
  }, [exercise.id, set.id, repsText, updateSet]);

  const handleToggle = useCallback(() => {
    updateSet(exercise.id, set.id, { done: !set.done });
  }, [exercise.id, set.id, set.done, updateSet]);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group',
        set.done
          ? 'border-surface-variant'
          : 'border-[#262626] hover:border-surface-variant'
      )}
      style={set.done ? {} : { borderColor: '#262626' }}
    >
      {/* Left side: set number + inputs */}
      <div className="flex items-center gap-3 flex-1">
        <span className="font-label-md text-on-secondary-container w-4">{index + 1}</span>

        {/* Weight input */}
        <div className="flex items-center gap-1 group-focus-within:border-primary-fixed-dim transition-all">
          <input
            type="number"
            value={weightText}
            onChange={(e) => setWeightText(e.target.value)}
            onBlur={handleWeightBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleWeightBlur(); }}
            disabled={set.done}
            className={cn(
              'w-16 bg-transparent text-center font-headline-md text-on-surface transition-colors',
              'border-0 border-b border-[#262626] rounded-none',
              'focus:border-primary-fixed-dim focus:ring-0 focus:outline-none',
              'disabled:opacity-80 disabled:cursor-default',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />
          {set.done ? (
            <span className="text-on-surface font-headline-md">{set.weight}</span>
          ) : null}
          <span className="font-label-sm text-on-secondary-container">kg</span>
        </div>

        {/* Reps input */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={repsText}
            onChange={(e) => setRepsText(e.target.value)}
            onBlur={handleRepsBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRepsBlur(); }}
            disabled={set.done}
            className={cn(
              'w-16 bg-transparent text-center font-headline-md text-on-surface transition-colors',
              'border-0 border-b border-[#262626] rounded-none',
              'focus:border-primary-fixed-dim focus:ring-0 focus:outline-none',
              'disabled:opacity-80 disabled:cursor-default',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />
          {set.done ? (
            <span className="text-on-surface font-headline-md">{set.reps}</span>
          ) : null}
          <span className="font-label-sm text-on-secondary-container">reps</span>
        </div>
      </div>

      {/* Right side: check button */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 active:scale-90',
          set.done
            ? 'bg-primary-fixed-dim text-on-primary-fixed border-primary-fixed-dim shadow-[0_0_15px_rgba(171,214,0,0.2)]'
            : 'border-surface-variant text-surface-variant hover:border-primary-fixed-dim hover:text-primary-fixed-dim'
        )}
      >
        {set.done ? (
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
            check
          </span>
        ) : (
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            check
          </span>
        )}
      </button>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const addSet = useGymStore((state) => state.addSet);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="space-y-3">
      {/* Exercise header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-headline-md text-on-surface">{exercise.name}</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#262626] text-secondary font-label-sm border border-transparent hover:border-primary-fixed-dim transition-colors">
            {exercise.muscleGroup}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="text-on-secondary-container hover:text-on-surface transition-colors p-1"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 bg-surface-container-high border border-outline-variant rounded-lg p-1 min-w-[120px]">
                <button className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-variant rounded transition-colors">
                  Rename
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-error hover:bg-surface-variant rounded transition-colors">
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Set rows */}
      <div className="space-y-1">
        {exercise.sets.map((set, idx) => (
          <SetRow key={set.id} exercise={exercise} set={set} index={idx} />
        ))}
      </div>

      {/* Add Set */}
      <button
        onClick={() => addSet(exercise.id)}
        className="flex items-center gap-2 font-label-md text-on-secondary-container hover:text-primary-fixed-dim transition-colors mt-2"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        Add set
      </button>
    </div>
  );
}

export function WorkoutLogger() {
  const todayWorkout = useGymStore((state) => state.todayWorkout);
  const addExercise = useGymStore((state) => state.addExercise);

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Track workout start time
  useEffect(() => {
    if (todayWorkout && !todayWorkout.completed) {
      setTimerRunning(true);
      const startTime = Date.now();
      const saved = sessionStorage.getItem('daylock-workout-start');
      const startTs = saved ? parseInt(saved, 10) : startTime;
      if (!saved) {
        sessionStorage.setItem('daylock-workout-start', String(startTime));
      }
      setElapsed(Math.floor((Date.now() - startTs) / 1000));

      const interval = setInterval(() => {
        const ts = parseInt(sessionStorage.getItem('daylock-workout-start') || String(Date.now()), 10);
        setElapsed(Math.floor((Date.now() - ts) / 1000));
      }, 1000);

      return () => {
        clearInterval(interval);
        setTimerRunning(false);
      };
    } else {
      setTimerRunning(false);
      sessionStorage.removeItem('daylock-workout-start');
    }
  }, [todayWorkout?.id, todayWorkout?.completed]);

  const isRestDay = !todayWorkout || todayWorkout.splitName === 'Rest';

  const handleAddExercise = () => {
    if (exerciseName.trim() && muscleGroup.trim()) {
      addExercise(exerciseName, muscleGroup);
      setExerciseName('');
      setMuscleGroup('');
      setShowAddExercise(false);
    }
  };

  if (isRestDay) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-secondary-container">bedtime</span>
          <h2 className="font-headline-md text-on-surface">Rest Day</h2>
          <p className="text-secondary text-body-md">Recovery is essential for progress.</p>
          <p className="text-on-surface-variant text-sm">Come back stronger tomorrow!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout timer */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed-dim/10 text-primary-fixed-dim font-label-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
          {timerRunning ? formatTime(elapsed) : '00:00:00'}
        </div>
      </div>

      {/* Exercise list */}
      {todayWorkout?.exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}

      {/* Add Exercise */}
      {!showAddExercise ? (
        <div className="flex justify-center pt-2 pb-8">
          <button
            onClick={() => setShowAddExercise(true)}
            className="inline-flex items-center gap-2 bg-primary-fixed-dim text-on-primary-fixed px-8 py-4 rounded-xl font-headline-md active:scale-95 transition-all shadow-[0_10px_40px_rgba(171,214,0,0.15)]"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add Exercise
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Exercise name"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-fixed-dim transition-colors text-sm"
          />
          <input
            type="text"
            placeholder="Muscle group"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-fixed-dim transition-colors text-sm"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowAddExercise(false); setExerciseName(''); setMuscleGroup(''); }}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-on-secondary-container text-sm font-medium hover:border-primary-fixed-dim transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExercise}
              disabled={!exerciseName.trim() || !muscleGroup.trim()}
              className="flex-1 px-3 py-2 rounded-lg bg-primary-fixed-dim text-on-primary-fixed text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
