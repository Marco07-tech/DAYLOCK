import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import { useGymStore } from '../../store/useGymStore'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          console.error('No session after callback:', error)
          navigate('/login')
          return
        }

        const user = session.user

        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        const userName =
          profile?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] || 'User'

        useAuthStore.getState().setUser({
          id: user.id,
          email: user.email!,
          name: userName,
        })
        useAuthStore.getState().setIsAuthenticated(true)
        useAuthStore.getState().setIsLoading(false)

        await useTaskStore.getState().loadTasks(user.id)
        await useGymStore.getState().loadGymSplit(user.id)
        await useGymStore.getState().loadTodayWorkout(user.id)

        const onboardingDone = profile?.onboarding_completed ?? false
        if (!onboardingDone) {
          navigate('/onboarding')
        } else {
          navigate('/dashboard')
        }
      } catch (err) {
        console.error('Callback error:', err)
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#A8FF3E',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        DayLock
      </div>
      <div
        style={{
          display: 'flex',
          gap: '6px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#A8FF3E',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}