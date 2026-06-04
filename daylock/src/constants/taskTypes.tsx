import type { TaskType } from '../types'

const icon = (name: string) => (
  <span className="material-symbols-outlined text-primary text-[32px]">{name}</span>
)

export const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  gym: icon('fitness_center'),
  study: icon('menu_book'),
  water: icon('water_drop'),
  sleep: icon('bedtime'),
  cardio: icon('directions_run'),
  steps: icon('directions_walk'),
  custom: icon('star'),
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
