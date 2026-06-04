import type { TaskType } from '../../../types';
import { cn } from '../../../lib/utils';

interface TaskTypePickerProps {
  selectedType: TaskType | null;
  onSelect: (type: TaskType) => void;
}

const TASK_TYPES: Array<{ type: TaskType; label: string; icon: string }> = [
  { type: 'gym', label: 'Gym', icon: 'fitness_center' },
  { type: 'study', label: 'Study', icon: 'menu_book' },
  { type: 'water', label: 'Water', icon: 'water_drop' },
  { type: 'sleep', label: 'Sleep', icon: 'bedtime' },
  { type: 'cardio', label: 'Cardio', icon: 'directions_run' },
  { type: 'steps', label: 'Steps', icon: 'directions_walk' },
  { type: 'custom', label: 'Custom', icon: 'star' },
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
          <span
            className={cn(
              'material-symbols-outlined text-[24px] transition-colors duration-150',
              selectedType === type ? 'text-accent-lime' : 'text-text-secondary'
            )}
          >
            {icon}
          </span>
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
