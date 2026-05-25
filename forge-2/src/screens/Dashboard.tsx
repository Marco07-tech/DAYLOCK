import { motion } from 'framer-motion'
import { Flame, Timer, Footprints, Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { WorkoutCTA } from '@/components/dashboard/WorkoutCTA'
import { ConsistencyGrid } from '@/components/dashboard/ConsistencyGrid'
import { userData, todayStats, weeklyActivity, consistencyData, workoutPlans } from '@/data/mock-data'

interface DashboardProps { onStartWorkout: () => void }

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

export function Dashboard({ onStartWorkout }: DashboardProps) {
  const featuredWorkout = workoutPlans.find(w => w.featured)
  return (
    <div className="min-h-screen pb-24">
      <Header userName={userData.name} />
      <motion.main className="px-5 space-y-4" variants={container} initial="hidden" animate="show">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Flame} iconColor="text-orange-500" value={todayStats.calories} unit="cal" label="Burned" progress={(todayStats.calories / todayStats.calorieGoal) * 100} />
          <StatCard icon={Timer} iconColor="text-blue-400" value={todayStats.activeMinutes} unit="min" label="Active" progress={(todayStats.activeMinutes / todayStats.activeGoal) * 100} />
          <StatCard icon={Footprints} iconColor="text-purple-400" value={todayStats.steps} unit="" label="Steps" progress={(todayStats.steps / todayStats.stepGoal) * 100} />
          <StatCard icon={Zap} iconColor="text-[var(--color-primary)]" value={todayStats.streak} unit="days" label="Streak" />
        </div>
        {featuredWorkout && (
          <WorkoutCTA workoutName={featuredWorkout.name} duration={featuredWorkout.duration} exercises={featuredWorkout.exercises} onStart={onStartWorkout} />
        )}
        <WeeklyChart data={weeklyActivity} />
        <ConsistencyGrid data={consistencyData} />
      </motion.main>
    </div>
  )
}
