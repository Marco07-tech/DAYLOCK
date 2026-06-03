import { Dumbbell, BookOpen, Droplet, Moon, Activity, Footprints, Star } from 'lucide-react';
import type { TaskType } from '../../../types';
import { cn } from '../../../lib/utils';

interface TaskTypePickerProps {
  selectedType: TaskType | null;
  onSelect: (type: TaskType) => void;
}

const TASK_TYPES: Array<{ type: TaskType; label: string; icon: React.ReactNode }> = [
  { type: 'gym', label: 'Gym', icon: <Dumbbell size={24} /> },
  { type: 'study', label: 'Study', icon: <BookOpen size={24} /> },
  { type: 'water', label: 'Water', icon: <Droplet size={24} /> },
  { type: 'sleep', label: 'Sleep', icon: <Moon size={24} /> },
  { type: 'cardio', label: 'Cardio', icon: <Activity size={24} /> },
  { type: 'steps', label: 'Steps', icon: <Footprints size={24} /> },
  { type: 'custom', label: 'Custom', icon: <Star size={24} /> },
];

export function TaskTypePicker({ selectedType, onSelect }: TaskTypePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TASK_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            'flex flex-col items-center justify-center px-3 py-4 rounded-2xl border transition-all duration-150',
            selectedType === type
              ? 'bg-accent-lime-muted border-accent-lime'
              : 'bg-bg-card border-bg-border hover:border-bg-border'
          )}
        >
          <div
            className={cn(
              'transition-colors duration-150',
              selectedType === type ? 'text-accent-lime' : 'text-text-secondary'
            )}
          >
            {icon}
          </div>
          <span
            className={cn(
              'text-xs font-medium mt-2 transition-colors duration-150',
              selectedType === type ? 'text-accent-lime' : 'text-text-secondary'
            )}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
