import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getPostAuthPath } from '../../lib/profile'
import { syncSessionToStores } from '../../lib/sessionSync'
import { useAuthStore } from '../../store/useAuthStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const setIsLoading = useAuthStore((state) => state.setIsLoading)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error || !data.session) {
            if (import.meta.env.DEV) {
              console.error('Code exchange failed:', error)
            }
            navigate('/login', { replace: true })
            return
          }

          const { onboardingCompleted } = await syncSessionToStores(data.session)
          navigate(getPostAuthPath(onboardingCompleted), { replace: true })
          return
        }

        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        if (hashParams.get('access_token')) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (session) {
            const { onboardingCompleted } = await syncSessionToStores(session)
            navigate(getPostAuthPath(onboardingCompleted), { replace: true })
            return
          }

          if (import.meta.env.DEV && error) {
            console.error('Session from hash failed:', error)
          }
        }

        navigate('/login', { replace: true })
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Callback error:', err)
        }
        navigate('/login', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [navigate, setIsLoading])

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
      <div style={{ display: 'flex', gap: '6px' }}>
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
