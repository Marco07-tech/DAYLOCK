import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { loadProfile } = useAuthStore()
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    const handle = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled.current) return
        if (session?.user) {
          await loadProfile(session.user.id)
          if (cancelled.current) return
          const profile = useAuthStore.getState().profile
          navigate(profile?.onboarding_completed ? '/' : '/onboarding', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error(e)
        navigate('/login', { replace: true })
      }
    }
    handle()
    return () => { cancelled.current = true }
  }, [navigate, loadProfile])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-ff-accent border-t-transparent rounded-full animate-spin" />
        <p className="font-label-caps text-label-caps text-ff-muted uppercase tracking-widest">Signing in...</p>
      </div>
    </div>
  )
}
