import { Dumbbell, BookOpen, Droplet, Moon, Activity, Footprints, Star } from 'lucide-react'
import type { TaskType } from '../types'

export const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  gym: <Dumbbell size={32} className="text-accent-lime" />,
  study: <BookOpen size={32} className="text-accent-lime" />,
  water: <Droplet size={32} className="text-accent-lime" />,
  sleep: <Moon size={32} className="text-accent-lime" />,
  cardio: <Activity size={32} className="text-accent-lime" />,
  steps: <Footprints size={32} className="text-accent-lime" />,
  custom: <Star size={32} className="text-accent-lime" />,
}

export const TYPE_NAMES: Record<TaskType, string> = {
  gym: 'Gym',
  study: 'Study',
  water: 'Water',
  sleep: 'Sleep',
  cardio: 'Cardio',
  steps: 'Steps',
  custom: 'Custom',
}
