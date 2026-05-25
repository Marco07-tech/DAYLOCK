export const userData = {
  name: 'Mehul',
  avatar: null,
  streak: 12,
  level: 'Intermediate',
  memberSince: '2024',
  totalWorkouts: 156,
  personalRecords: 23,
}

export const todayStats = {
  calories: 420,
  calorieGoal: 600,
  activeMinutes: 45,
  activeGoal: 60,
  steps: 8432,
  stepGoal: 10000,
  streak: 12,
}

export const weeklyActivity = [
  { day: 'M', volume: 85, active: true },
  { day: 'T', volume: 60, active: true },
  { day: 'W', volume: 100, active: true },
  { day: 'T', volume: 0, active: false },
  { day: 'F', volume: 75, active: true },
  { day: 'S', volume: 90, active: true },
  { day: 'S', volume: 0, active: false, isToday: true },
]

export const consistencyData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  level: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
}))

export const workoutPlans = [
  {
    id: '1', name: 'Push Day', duration: '45 min', difficulty: 'Intermediate',
    exercises: 6, muscleGroups: ['Chest', 'Shoulders', 'Triceps'], featured: true, scheduled: 'Today',
  },
  {
    id: '2', name: 'Pull Day', duration: '50 min', difficulty: 'Intermediate',
    exercises: 7, muscleGroups: ['Back', 'Biceps', 'Rear Delts'], scheduled: 'Tomorrow',
  },
  {
    id: '3', name: 'Leg Day', duration: '55 min', difficulty: 'Advanced',
    exercises: 8, muscleGroups: ['Quads', 'Hamstrings', 'Glutes'], scheduled: 'Wed',
  },
  {
    id: '4', name: 'Upper Body', duration: '40 min', difficulty: 'Beginner',
    exercises: 5, muscleGroups: ['Chest', 'Back', 'Arms'],
  },
  {
    id: '5', name: 'Full Body', duration: '60 min', difficulty: 'Advanced',
    exercises: 10, muscleGroups: ['Full Body'],
  },
]

export const exercises = [
  {
    id: 'e1', name: 'Bench Press', muscleGroup: 'Chest',
    sets: [
      { id: 1, reps: 10, weight: 60, completed: false },
      { id: 2, reps: 8, weight: 65, completed: false },
      { id: 3, reps: 6, weight: 70, completed: false },
    ],
  },
  {
    id: 'e2', name: 'Overhead Press', muscleGroup: 'Shoulders',
    sets: [
      { id: 1, reps: 10, weight: 40, completed: false },
      { id: 2, reps: 8, weight: 42.5, completed: false },
      { id: 3, reps: 8, weight: 42.5, completed: false },
    ],
  },
  {
    id: 'e3', name: 'Cable Flyes', muscleGroup: 'Chest',
    sets: [
      { id: 1, reps: 12, weight: 15, completed: false },
      { id: 2, reps: 12, weight: 15, completed: false },
      { id: 3, reps: 10, weight: 17.5, completed: false },
    ],
  },
  {
    id: 'e4', name: 'Tricep Pushdown', muscleGroup: 'Triceps',
    sets: [
      { id: 1, reps: 15, weight: 25, completed: false },
      { id: 2, reps: 12, weight: 27.5, completed: false },
      { id: 3, reps: 12, weight: 27.5, completed: false },
    ],
  },
]

export const nutritionData = {
  calories: { consumed: 1840, goal: 2200 },
  macros: {
    protein: { consumed: 142, goal: 180, color: '#a3e635' },
    carbs: { consumed: 195, goal: 250, color: '#38bdf8' },
    fat: { consumed: 58, goal: 70, color: '#fb923c' },
  },
  water: { consumed: 2.1, goal: 3.5 },
  meals: [
    {
      id: 'm1', name: 'Breakfast', time: '8:00 AM', calories: 480,
      items: ['4 Egg Whites', 'Oats (80g)', 'Banana'],
    },
    {
      id: 'm2', name: 'Lunch', time: '1:00 PM', calories: 620,
      items: ['Chicken Breast (200g)', 'Brown Rice (150g)', 'Dal'],
    },
    {
      id: 'm3', name: 'Pre-Workout', time: '5:30 PM', calories: 240,
      items: ['Protein Shake', 'Apple'],
    },
    {
      id: 'm4', name: 'Dinner', time: '9:00 PM', calories: 500,
      items: ['Paneer Bhurji', 'Chapati x2', 'Salad'],
    },
  ],
}

export const historyData = [
  {
    id: 'h1', date: 'Today', workoutName: 'Push Day',
    duration: '48 min', volume: '4,200 kg', sets: 18, prs: 1,
  },
  {
    id: 'h2', date: 'Yesterday', workoutName: 'Pull Day',
    duration: '52 min', volume: '3,800 kg', sets: 21, prs: 0,
  },
  {
    id: 'h3', date: 'Mon', workoutName: 'Leg Day',
    duration: '61 min', volume: '6,100 kg', sets: 24, prs: 2,
  },
  {
    id: 'h4', date: 'Sun', workoutName: 'Push Day',
    duration: '45 min', volume: '4,000 kg', sets: 18, prs: 0,
  },
]

export const personalRecords = [
  { exercise: 'Bench Press', weight: '90 kg', date: '2 weeks ago' },
  { exercise: 'Deadlift', weight: '120 kg', date: '1 month ago' },
  { exercise: 'Squat', weight: '100 kg', date: '3 weeks ago' },
  { exercise: 'OHP', weight: '55 kg', date: '1 week ago' },
]

export const stepsData = {
  today: 8432,
  goal: 10000,
  weeklySteps: [
    { day: 'M', steps: 9200 },
    { day: 'T', steps: 7800 },
    { day: 'W', steps: 11200 },
    { day: 'T', steps: 4500 },
    { day: 'F', steps: 8900 },
    { day: 'S', steps: 10300 },
    { day: 'S', steps: 8432 },
  ],
  distance: 6.2,
  calories: 312,
}

export const achievements = [
  { id: 'a1', title: '7-Day Streak', icon: '🔥', unlocked: true, date: 'This week' },
  { id: 'a2', title: 'First PR', icon: '🏆', unlocked: true, date: 'Jan 2024' },
  { id: 'a3', title: '100 Workouts', icon: '💯', unlocked: true, date: 'Mar 2024' },
  { id: 'a4', title: 'Iron Warrior', icon: '⚔️', unlocked: false },
  { id: 'a5', title: '30-Day Streak', icon: '📅', unlocked: false },
  { id: 'a6', title: 'Volume King', icon: '👑', unlocked: false },
]
