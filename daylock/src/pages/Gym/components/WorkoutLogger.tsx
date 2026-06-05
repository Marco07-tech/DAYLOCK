import { useState, useEffect, useCallback } from 'react';
import { useGymStore } from '../../../store/useGymStore';
import { cn } from '../../../lib/utils';

function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ExerciseSection({ exercise, index }: { exercise: { id: string; name: string; muscleGroup: string; sets: { id: string; weight: number; reps: number; done: boolean }[] }; index: number }) {
  const updateSet = useGymStore((state) => state.updateSet);
  const addSet = useGymStore((state) => state.addSet);
  const removeSet = useGymStore((state) => state.removeSet);
  const removeExercise = useGymStore((state) => state.removeExercise);
  const renameExercise = useGymStore((state) => state.renameExercise);

  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(exercise.name);

  const handleSetDone = (setId: string, currentDone: boolean) => {
    setAnimatingId(setId);
    setTimeout(() => setAnimatingId(null), 400);
    updateSet(exercise.id, setId, { done: !currentDone });
  };

  const activeSetIndex = exercise.sets.findIndex((s) => !s.done);

  return (
    <div className="mb-8">
      {/* Exercise header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {editingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => {
                if (editName.trim()) {
                  renameExercise(exercise.id, editName.trim());
                }
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editName.trim()) {
                    renameExercise(exercise.id, editName.trim());
                  }
                  setEditingName(false);
                }
              }}
              className="font-[Literata] text-[26px] font-semibold text-on-surface leading-tight bg-transparent border-b border-primary outline-none w-full"
              autoFocus
            />
          ) : (
            <h3 className="font-[Literata] text-[26px] font-semibold text-on-surface leading-tight">
              {exercise.name}
            </h3>
          )}
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8EDE8] text-[#3C4A3D]">
            {exercise.muscleGroup}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant opacity-40 hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white border border-[#E0DDD8] rounded-xl shadow-lg p-1 min-w-[130px]">
                <button
                  onClick={() => { setEditingName(true); setEditName(exercise.name); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-[#F8F6F3] rounded transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => { removeExercise(exercise.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error-container rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 px-3 mb-2">
        <div className="col-span-2 font-label-sm text-label-sm text-on-surface-variant opacity-50 uppercase text-center">Set</div>
        <div className="col-span-4 font-label-sm text-label-sm text-on-surface-variant opacity-50 uppercase text-center">kg</div>
        <div className="col-span-4 font-label-sm text-label-sm text-on-surface-variant opacity-50 uppercase text-center">Reps</div>
        <div className="col-span-2"></div>
      </div>

      {/* Set rows */}
      <div className="space-y-2">
        {exercise.sets.map((set, i) => (
          <div
            key={set.id}
            className={cn(
              'grid grid-cols-12 gap-2 items-center px-3 py-3 rounded-xl transition-all duration-300',
              set.done
                ? 'bg-primary/8 opacity-70'
                : i === activeSetIndex
                  ? 'bg-white border border-primary/20 shadow-sm'
                  : 'bg-surface-container-low',
              animatingId === set.id ? 'scale-[1.02]' : ''
            )}
          >
            {/* Set number */}
            <div className={cn(
              'col-span-2 text-center font-label-md text-label-md',
              set.done ? 'text-primary' : 'text-on-surface-variant opacity-60'
            )}>
              {i + 1}
            </div>

            {/* Weight input */}
            <div className="col-span-4 flex justify-center">
              {set.done ? (
                <span className="font-body-md text-body-md text-on-surface text-center w-16">{set.weight}</span>
              ) : (
                <input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => updateSet(exercise.id, set.id, { weight: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-transparent border-0 border-b border-outline-variant text-center font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
              )}
            </div>

            {/* Reps input */}
            <div className="col-span-4 flex justify-center">
              {set.done ? (
                <span className="font-body-md text-body-md text-on-surface text-center w-12">{set.reps}</span>
              ) : (
                <input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => updateSet(exercise.id, set.id, { reps: parseFloat(e.target.value) || 0 })}
                  className="w-12 bg-transparent border-0 border-b border-outline-variant text-center font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
              )}
            </div>

            {/* Done toggle */}
            <div className="col-span-2 flex justify-center">
              <button
                onClick={() => handleSetDone(set.id, set.done)}
                className={cn(
                  'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90',
                  set.done
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'border-outline-variant hover:border-primary'
                )}
              >
                {set.done && (
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 700" }}>
                    check
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add set */}
      <button
        onClick={() => addSet(exercise.id)}
        className="flex items-center gap-1.5 mt-3 ml-3 text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span className="font-label-sm text-label-sm">Add set</span>
      </button>

      {/* Thin divider between exercises */}
      <div className="h-px bg-outline-variant/30 mt-8" />
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
      addExercise(exerciseName.trim(), muscleGroup.trim());
      setExerciseName('');
      setMuscleGroup('');
      setShowAddExercise(false);
    }
  };

  if (isRestDay) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">bedtime</span>
          <h2 className="font-headline-md text-on-surface">Rest Day</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Recovery is essential for progress.</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Come back stronger tomorrow!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout timer */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8EDE8] text-[#3C4A3D] font-label-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
          {timerRunning ? formatTime(elapsed) : '00:00:00'}
        </div>
      </div>

      {/* Exercise list */}
      {todayWorkout?.exercises.map((exercise, idx) => (
        <ExerciseSection key={exercise.id} exercise={exercise} index={idx} />
      ))}

      {/* Add Exercise inline form */}
      {!showAddExercise ? (
        <div className="flex justify-center pt-2 pb-8">
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-label-md text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(81,96,81,0.2)]"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add Exercise
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-3">
          <input
            type="text"
            placeholder="Exercise name"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') muscleGroup.trim() && handleAddExercise(); }}
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors text-sm"
          />
          <input
            type="text"
            placeholder="Muscle group"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') exerciseName.trim() && handleAddExercise(); }}
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary transition-colors text-sm"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowAddExercise(false); setExerciseName(''); setMuscleGroup(''); }}
              className="flex-1 px-3 py-2 rounded-lg border border-outline-variant text-on-surface font-label-sm hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExercise}
              disabled={!exerciseName.trim() || !muscleGroup.trim()}
              className="flex-1 px-3 py-2 rounded-lg bg-primary text-on-primary font-label-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
