import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { signInWithGoogle } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function SignupPage() {
  const { signup, isLoading, error, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (error) clearError()
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) clearError()
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!name || !email || !password) {
      return
    }

    if (password.length < 6) {
      clearError()
      useAuthStore.setState({ error: 'Password must be at least 6 characters.' })
      return
    }

    await signup(email, password, name)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (googleError) {
      if (import.meta.env.DEV) {
        console.error(googleError)
      }
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 page-enter">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl text-accent-lime mb-2">DayLock</h1>
          <p className="text-text-muted text-base">Lock in your daily routine</p>
        </div>

        <Card className="p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-12 rounded-xl bg-[#1A1A24] border border-[#2A2A35] hover:border-[#3A3A45] hover:bg-[#222230] transition-all duration-200 flex flex-row gap-[10px] justify-center items-center disabled:opacity-70"
            >
              {googleLoading ? (
                <>
                  <span className="h-[18px] w-[18px] rounded-full border-2 border-[#4A4A5A] border-t-white animate-spin" />
                  <span className="text-sm font-medium text-white">Redirecting...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span className="text-sm font-medium text-white">Continue with Google</span>
                </>
              )}
            </button>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#2A2A35]" />
              <span className="text-xs text-[#4A4A5A]">or</span>
              <span className="h-px flex-1 bg-[#2A2A35]" />
            </div>

            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={handleNameChange}
                autoComplete="name"
                className="w-full bg-primary border border-bg-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                className="w-full bg-primary border border-bg-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                className="w-full bg-primary border border-bg-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
              />
            </div>

            {error && <p className="text-status-danger text-sm text-center">{error}</p>}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-6">
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-lime hover:text-accent-lime-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
