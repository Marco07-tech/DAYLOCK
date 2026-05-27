import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Timer, Footprints, Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { WorkoutCTA } from '@/components/dashboard/WorkoutCTA'
import { ConsistencyGrid } from '@/components/dashboard/ConsistencyGrid'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { todayStats, weeklyActivity, consistencyData, workoutPlans } from '@/data/mock-data'

interface DashboardProps { onStartWorkout: () => void }

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

export function Dashboard({ onStartWorkout }: DashboardProps) {
  const { user } = useAuthStore()
  const [userProfile, setUserProfile] = useState<{ name: string; goal: string } | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, goal')
          .eq('id', user.id)
          .single()

        if (error) {
          console.warn('Profile fetch error (expected if users table not ready):', error.message)
          return
        }

        if (data) {
          setUserProfile(data)
        }
      } catch (err) {
        console.warn('Failed to fetch profile:', err)
        // Silently fail - will use fallback from auth store
      }
    }

    fetchProfile()
  }, [user?.id])

  const featuredWorkout = workoutPlans.find(w => w.featured)
  const displayName = userProfile?.name || user?.name || 'Athlete'

  return (
    <div className="min-h-screen pb-24">
      <Header userName={displayName} />
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
