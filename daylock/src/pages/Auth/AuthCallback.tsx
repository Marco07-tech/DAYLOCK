import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import { useGymStore } from '../../store/useGymStore'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSession = async (session: any) => {
      const user = session.user

      const { data: profile } = await supabase
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
      navigate(onboardingDone ? '/dashboard' : '/onboarding')
    }

    const handleCallback = async () => {
      try {
        console.log('AuthCallback: URL search params:', window.location.search)
        console.log('AuthCallback: URL hash:', window.location.hash)

        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        console.log('AuthCallback: code found:', !!code)

        if (code) {
          console.log('AuthCallback: exchanging code for session...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          console.log('AuthCallback: exchange result:', {
            hasSession: !!data?.session,
            error: error?.message,
          })

          if (error || !data.session) {
            console.error('Code exchange failed:', error)
            navigate('/login')
            return
          }

          await handleSession(data.session)
          return
        }

        // Check for hash-based token (implicit flow fallback)
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        console.log('AuthCallback: access_token in hash:', !!accessToken)

        if (accessToken) {
          // Small delay to let Supabase process the hash
          await new Promise((resolve) => setTimeout(resolve, 500))
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()
          console.log('AuthCallback: session from hash:', !!session, error?.message)

          if (session) {
            await handleSession(session)
            return
          }
        }

        console.error('No session: null')
        navigate('/login')
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