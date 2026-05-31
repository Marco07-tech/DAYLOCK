import { useState } from 'react';
import { Plus, Moon } from 'lucide-react';
import { useGymStore } from '../../../store/useGymStore';
import { ExerciseCard } from './ExerciseCard';

export function WorkoutLogger() {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');

  const todayWorkout = useGymStore((state) => state.todayWorkout);
  const addExercise = useGymStore((state) => state.addExercise);

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
        <div className="bg-bg-card border border-bg-border rounded-2xl p-8 text-center">
          <Moon size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-text-primary text-xl font-semibold mb-2 font-display">
            Rest Day
          </h3>
          <p className="text-text-secondary text-sm">Recovery is part of the grind</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {todayWorkout?.exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}

      {/* Add Exercise Section */}
      {!showAddExercise ? (
        <button
          onClick={() => setShowAddExercise(true)}
          className="w-full h-12 rounded-2xl border border-dashed border-bg-border text-text-secondary hover:border-accent-lime hover:text-accent-lime transition-all duration-150 flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Plus size={16} />
          Add Exercise
        </button>
      ) : (
        <div className="bg-bg-card border border-bg-border rounded-2xl p-4 space-y-3">
          <div>
            <label className="block text-text-secondary text-xs mb-1.5 font-medium">
              Exercise name
            </label>
            <input
              type="text"
              placeholder="e.g. Bench Press"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs mb-1.5 font-medium">
              Muscle group
            </label>
            <input
              type="text"
              placeholder="e.g. Chest"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setShowAddExercise(false);
                setExerciseName('');
                setMuscleGroup('');
              }}
              className="flex-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-bg-border text-text-secondary hover:border-accent-lime transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExercise}
              disabled={!exerciseName.trim() || !muscleGroup.trim()}
              className="flex-1 px-3 py-1.5 rounded-lg bg-accent-lime text-black hover:bg-accent-lime-dark transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
