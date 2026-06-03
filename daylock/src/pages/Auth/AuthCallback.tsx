import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getPostAuthPath } from '../../lib/profile'
import { syncAuthSession, loadUserDataStores } from '../../lib/sessionSync'
import { useAuthStore } from '../../store/useAuthStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const setIsLoading = useAuthStore((state) => state.setIsLoading)

  useEffect(() => {
    let cancelled = false

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
            if (!cancelled) navigate('/login', { replace: true })
            return
          }

          const { onboardingCompleted } = await syncAuthSession(data.session)
          if (!cancelled) setIsLoading(false)
          if (!cancelled) void loadUserDataStores(data.session.user.id)
          if (!cancelled) navigate(getPostAuthPath(onboardingCompleted), { replace: true })
          return
        }

        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        if (hashParams.get('access_token')) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          if (cancelled) return
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (session) {
            const { onboardingCompleted } = await syncAuthSession(session)
            if (!cancelled) setIsLoading(false)
            if (!cancelled) void loadUserDataStores(session.user.id)
            if (!cancelled) navigate(getPostAuthPath(onboardingCompleted), { replace: true })
            return
          }

          if (import.meta.env.DEV && error) {
            console.error('Session from hash failed:', error)
          }
        }

        if (!cancelled) navigate('/login', { replace: true })
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Callback error:', err)
        }
        if (!cancelled) navigate('/login', { replace: true })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    handleCallback()

    return () => {
      cancelled = true
    }
  }, [navigate, setIsLoading])

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4">
      <div className="text-[#A8FF3E] text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        DayLock
      </div>
      <div className="flex gap-[6px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#A8FF3E]"
            style={{
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
