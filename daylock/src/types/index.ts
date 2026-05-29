// User type
export interface User {
  id: string;
  email: string;
  name: string;
}

// Task types
export type TaskType = 'gym' | 'study' | 'water' | 'sleep' | 'cardio' | 'custom';

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  icon: string;
  meta?: Record<string, unknown>;
  streak: number;
  done: boolean;
  scheduledDays: string[];
  scheduledTime?: string;
  createdAt?: string;
}

// Gym types
export type GymSplit = 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Rest';

export interface Set {
  id: string;
  weight: number;
  reps: number;
  done: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
}

export interface WorkoutLog {
  id?: string;
  date: string;
  splitName: GymSplit;
  exercises: Exercise[];
  completed: boolean;
  createdAt?: string;
}

export interface WeeklySplit {
  [day: string]: GymSplit;
}
