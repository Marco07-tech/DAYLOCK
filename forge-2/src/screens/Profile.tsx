import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Flame } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { userData, achievements } from '@/data/mock-data'

interface ProfileProps {
  onLogout?: () => void
}

interface UserProfile {
  name: string
  goal: string
  age: number
  weight_kg: number
  height_cm: number
}

export function Profile({ onLogout }: ProfileProps) {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  useEffect(() => {
    if (!user?.id) return

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, goal, age, weight_kg, height_cm')
          .eq('id', user.id)
          .single()

        if (error) {
          console.warn('Profile fetch error (expected if users table not ready):', error.message)
          return
        }

        if (data) {
          setProfile(data)
        }
      } catch (err) {
        console.warn('Failed to fetch profile:', err)
        // Silently fail - will use fallback from auth store
      }
    }

    fetchProfile()
  }, [user?.id])

  const displayName = profile?.name || user?.name || 'Athlete'
  const displayGoal = profile?.goal
    ? profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)
    : 'Fitness'
  const avatarLetter = (displayName || 'A')[0].toUpperCase()

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-8 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-2xl font-bold text-black">{avatarLetter}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{displayName}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-2 py-1 rounded-full">
                {displayGoal}
              </span>
              <span className="text-xs text-[var(--color-muted)]">{user?.email || 'No email'}</span>
            </div>
          </div>
        </div>
      </div>

      <motion.main
        className="px-5 space-y-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      >
        {/* Stats */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary)]/15 mx-auto mb-2">
              <Zap className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{userData.totalWorkouts}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">Workouts</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-400/15 mx-auto mb-2">
              <Trophy className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{userData.personalRecords}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">PRs</p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-400/15 mx-auto mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{userData.streak}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">Streak</p>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">Achievements</h3>
            <span className="text-xs text-[var(--color-muted)]">
              {unlockedCount} / {totalAchievements}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileTap={{ scale: 0.95 }}
                className={`rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  achievement.unlocked
                    ? 'bg-[var(--color-surface)] border border-[var(--color-primary)]/30'
                    : 'bg-[var(--color-surface)]/50 border border-[var(--color-border)]'
                }`}
              >
                <span className="text-3xl">{achievement.icon}</span>
                <div className="text-center">
                  <p className={`text-[10px] font-semibold ${
                    achievement.unlocked ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted)]'
                  }`}>
                    {achievement.title}
                  </p>
                  {achievement.unlocked && achievement.date && (
                    <p className="text-[8px] text-[var(--color-muted)] mt-1">{achievement.date}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="space-y-2"
        >
          <button className="w-full py-3.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-foreground)] font-semibold touch-feedback text-sm">
            Edit Profile
          </button>
          <button className="w-full py-3.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-foreground)] font-semibold touch-feedback text-sm">
            Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full py-3.5 rounded-xl bg-red-400/10 text-red-400 font-semibold touch-feedback text-sm hover:bg-red-400/20 transition-colors"
          >
            Sign Out
          </button>
        </motion.div>
      </motion.main>
    </div>
  )
}
