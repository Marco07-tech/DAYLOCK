import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav, TabId } from '@/components/layout/BottomNav'
import { Dashboard } from '@/screens/Dashboard'
import { WorkoutPlans } from '@/screens/WorkoutPlans'
import { ActiveWorkout } from '@/screens/ActiveWorkout'
import { Nutrition } from '@/screens/Nutrition'
import { History } from '@/screens/History'
import { Steps } from '@/screens/Steps'
import { Profile } from '@/screens/Profile'
import { useAuthStore } from '@/store/authStore'
import { LogOut } from 'lucide-react'

type Screen = 'dashboard' | 'workout' | 'active-workout' | 'steps' | 'history' | 'nutrition' | 'profile'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

export function DashboardApp() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const { logout } = useAuthStore()

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setCurrentScreen(tab)
  }

  const handleStartWorkout = () => {
    setSelectedWorkoutId('1')
    setCurrentScreen('active-workout')
  }

  const handleSelectWorkout = (workoutId: string) => {
    setSelectedWorkoutId(workoutId)
    setCurrentScreen('active-workout')
  }

  const handleBackFromWorkout = () => {
    setCurrentScreen('workout')
    setSelectedWorkoutId(null)
  }

  const handleFinishWorkout = () => {
    setCurrentScreen('dashboard')
    setActiveTab('dashboard')
    setSelectedWorkoutId(null)
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard onStartWorkout={handleStartWorkout} />
      case 'workout': return <WorkoutPlans onSelectWorkout={handleSelectWorkout} />
      case 'active-workout': return <ActiveWorkout workoutId={selectedWorkoutId || '1'} onBack={handleBackFromWorkout} onFinish={handleFinishWorkout} />
      case 'nutrition': return <Nutrition />
      case 'history': return <History />
      case 'steps': return <Steps />
      case 'profile': return <Profile onLogout={handleLogout} />
      default: return <Dashboard onStartWorkout={handleStartWorkout} />
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      {currentScreen !== 'active-workout' && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  )
}
