import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, isLoading, isAuthenticated, error, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

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

    await signup(email, password, name)
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 page-enter">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl text-accent-lime mb-2">
            DayLock
          </h1>
          <p className="text-text-muted text-base">Lock in your daily routine</p>
        </div>

        {/* Form Card */}
        <Card className="p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-primary border border-bg-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className="w-full bg-primary border border-bg-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-primary border border-bg-border rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
              />
            </div>

            {error && (
              <p className="text-status-danger text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-6"
            >
              Create Account
            </Button>
          </form>
        </Card>

        {/* Login Link */}
        <p className="text-center text-text-secondary mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent-lime hover:text-accent-lime-dark transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
