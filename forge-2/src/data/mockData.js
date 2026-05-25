import { Activity, Dumbbell, Flame, HeartPulse } from 'lucide-react'

export const stats = [
  {
    label: 'Calories',
    value: '2,140',
    detail: '+180 from yesterday',
    icon: Flame,
  },
  {
    label: 'Workouts',
    value: '5',
    detail: 'This week',
    icon: Dumbbell,
  },
  {
    label: 'Recovery',
    value: '82%',
    detail: 'Ready for next push',
    icon: HeartPulse,
  },
  {
    label: 'Activity',
    value: '9.4k',
    detail: 'Steps today',
    icon: Activity,
  },
]

export const workouts = [
  {
    title: 'Upper Body Power',
    focus: 'Chest, shoulders, triceps',
    duration: '48 min',
    status: 'Ready',
  },
  {
    title: 'Zone 2 Endurance',
    focus: 'Steady cardio and mobility',
    duration: '36 min',
    status: 'Planned',
  },
]

export const weeklyActivity = [
  { day: 'Mon', value: 68 },
  { day: 'Tue', value: 84 },
  { day: 'Wed', value: 52 },
  { day: 'Thu', value: 91 },
  { day: 'Fri', value: 76 },
  { day: 'Sat', value: 60 },
  { day: 'Sun', value: 46 },
]