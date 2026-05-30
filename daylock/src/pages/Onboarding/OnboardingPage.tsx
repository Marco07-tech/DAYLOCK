import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sunrise } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import type { Task } from '../../types'

type Goal = 'cut' | 'bulk' | 'maintain' | null

type Step = 1 | 2 | 3

const GOALS: Array<{
  value: Exclude<Goal, null>
  icon: string
  title: string
  subtitle: string
}> = [
  { value: 'cut', icon: '🔥', title: 'Cut', subtitle: 'Lose fat, get lean' },
  { value: 'bulk', icon: '💪', title: 'Bulk', subtitle: 'Build muscle, gain size' },
  { value: 'maintain', icon: '⚖️', title: 'Maintain', subtitle: 'Stay consistent, keep balance' },
]

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null

  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/)
  if (!match) return null

  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2] || '0', 10)
  const period = match[3]

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  if (period === 'pm' && hours !== 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0

  return hours * 60 + minutes
}

function formatSleepDuration(wakeTime: string, sleepTime: string): { hours: number | null; label: string; subtext: string; tone: string } {
  const wakeMinutes = parseTimeToMinutes(wakeTime)
  const sleepMinutes = parseTimeToMinutes(sleepTime)

  if (wakeMinutes === null || sleepMinutes === null) {
    return { hours: null, label: '', subtext: '', tone: '' }
  }

  let durationMinutes = wakeMinutes - sleepMinutes
  if (durationMinutes <= 0) {
    durationMinutes += 24 * 60
  }

  const hours = durationMinutes / 60

  if (hours >= 7) {
    return { hours, label: `That's ${hours.toFixed(1).replace('.0', '')} hours of sleep`, subtext: '✓ Optimal!', tone: 'text-accent-lime' }
  }

  if (hours >= 5) {
    return { hours, label: `That's ${hours.toFixed(1).replace('.0', '')} hours of sleep`, subtext: '⚠ Try for 7+', tone: 'text-status-warning' }
  }

  return { hours, label: `That's ${hours.toFixed(1).replace('.0', '')} hours of sleep`, subtext: '❌ Too little sleep', tone: 'text-status-danger' }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUserName = useAuthStore((state) => state.updateUserName)
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted)
  const addTask = useTaskStore((state) => state.addTask)
  const [step, setStep] = useState<Step>(1)
  const [stepClass, setStepClass] = useState('step-enter')
  const [name, setName] = useState(user?.name || '')
  const [goal, setGoal] = useState<Goal>(null)
  const [wakeTime, setWakeTime] = useState('')
  const [sleepTime, setSleepTime] = useState('')
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }
  }, [user?.name])

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
    }
  }, [])

  if (!user) {
    return null
  }

  const goToStep = (nextStep: Step) => {
    if (nextStep === step) return

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
    }

    setStepClass('step-exit')
    transitionTimerRef.current = setTimeout(() => {
      setStep(nextStep)
      setStepClass('step-enter')
      transitionTimerRef.current = setTimeout(() => {
        setStepClass('')
      }, 260)
    }, 200)
  }

  const finishSetup = async (skipSleepTask = false) => {
    if (!user) return

    const trimmedName = name.trim()
    const targetName = trimmedName || user.name

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: targetName,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (error) {
        console.error('Failed to update onboarding status:', error)
      }

      updateUserName(targetName)
      setOnboardingCompleted(true)

      if (!skipSleepTask && (wakeTime.trim() || sleepTime.trim())) {
        const sleepTask: Omit<Task, 'id' | 'streak' | 'done'> = {
          type: 'sleep',
          name: `Sleep by ${sleepTime || 'your target time'}`,
          icon: 'moon',
          meta: `Wake: ${wakeTime || '—'} · Bed: ${sleepTime || '—'}`,
          scheduledDays: ALL_DAYS,
          scheduledTime: sleepTime,
        }

        await addTask(sleepTask, user.id)
      }

      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error('Failed to finish onboarding:', error)
      updateUserName(targetName)
      setOnboardingCompleted(true)
      navigate('/dashboard', { replace: true })
    }
  }

  const sleepPreview = formatSleepDuration(wakeTime, sleepTime)
  const activeGoal = GOALS.find((item) => item.value === goal)

  return (
    <div className="min-h-screen bg-bg-primary page-enter">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 py-6">
        {step === 1 && (
          <div className={`flex flex-1 flex-col justify-between ${stepClass}`}>
            <div className="pt-5 text-center">
              <p className="font-display text-[28px] text-accent-lime">DayLock</p>
              <h1 className="mt-2 font-display text-[22px] text-white">Welcome aboard! 👋</h1>
              <p className="mt-2 text-sm text-text-secondary">Let's set up your routine in 2 minutes</p>
            </div>

            <div className="rounded-2xl border border-bg-border bg-bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-lime bg-[rgba(168,255,62,0.1)]">
                <span className="font-display text-[24px] text-accent-lime">
                  {(name.trim()[0] || user.name?.[0] || '?').toUpperCase()}
                </span>
              </div>

              <p className="mt-5 text-center text-xs text-text-secondary">What should we call you?</p>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="mt-3 w-full rounded-xl border border-bg-border bg-bg-primary px-4 py-3 text-center text-base text-white outline-none transition-colors placeholder:text-text-muted focus:border-accent-lime"
              />

              <div className="mt-6 flex items-center justify-center gap-2">
                {[1, 2, 3].map((item) => (
                  <span
                    key={item}
                    className={`h-2 rounded-full transition-all ${item === 1 ? 'w-6 bg-accent-lime' : 'w-2 bg-bg-border'}`}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={() => goToStep(2)}
              disabled={!name.trim()}
              className="mt-5 w-full"
              size="lg"
            >
              Let's go →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className={`flex flex-1 flex-col ${stepClass}`}>
            <button
              onClick={() => goToStep(1)}
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-bg-border text-white transition-colors hover:border-accent-lime"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="font-display text-[22px] text-white">What's your goal? 💪</h1>
            <p className="mt-2 text-sm text-text-secondary">This helps us personalize your experience</p>

            <div className="mt-6 space-y-3">
              {GOALS.map((item) => {
                const selected = goal === item.value
                return (
                  <button
                    key={item.value}
                    onClick={() => setGoal(item.value)}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-150 ${
                      selected
                        ? 'border-accent-lime bg-[rgba(168,255,62,0.1)]'
                        : 'border-bg-border bg-bg-card'
                    }`}
                  >
                    <span className="text-[32px] leading-none">{item.icon}</span>
                    <div>
                      <p className={`font-display text-[18px] font-semibold ${selected ? 'text-accent-lime' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-[13px] text-text-secondary">{item.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <Button
              onClick={() => goToStep(3)}
              disabled={!goal}
              className="mt-6 w-full"
              size="lg"
            >
              Next →
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className={`flex flex-1 flex-col ${stepClass}`}>
            <button
              onClick={() => goToStep(2)}
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-bg-border text-white transition-colors hover:border-accent-lime"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="font-display text-[22px] text-white">Sleep schedule 😴</h1>
            <p className="mt-2 text-sm text-text-secondary">We'll remind you when to sleep and wake up</p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-bg-border bg-bg-card p-5">
                <div className="flex items-center gap-2 text-accent-lime">
                  <Sunrise size={24} />
                  <p className="text-xs text-text-secondary">Wake up time</p>
                </div>
                <input
                  value={wakeTime}
                  onChange={(event) => setWakeTime(event.target.value)}
                  placeholder="e.g. 6:30 AM"
                  className="mt-4 w-full bg-transparent text-center font-display text-[24px] text-white outline-none border-b-2 border-bg-border pb-2 transition-colors placeholder:text-text-muted focus:border-accent-lime"
                />
              </div>

              <div className="rounded-2xl border border-bg-border bg-bg-card p-5">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Moon size={24} />
                  <p className="text-xs text-text-secondary">Bedtime</p>
                </div>
                <input
                  value={sleepTime}
                  onChange={(event) => setSleepTime(event.target.value)}
                  placeholder="e.g. 11:00 PM"
                  className="mt-4 w-full bg-transparent text-center font-display text-[24px] text-white outline-none border-b-2 border-bg-border pb-2 transition-colors placeholder:text-text-muted focus:border-accent-lime"
                />
              </div>
            </div>

            {sleepPreview.hours !== null && (
              <div className={`mt-4 text-center text-sm font-medium ${sleepPreview.tone}`}>
                <p>{sleepPreview.label}</p>
                <p className="mt-1 text-xs text-text-secondary">{sleepPreview.subtext}</p>
              </div>
            )}

            <Button
              onClick={() => finishSetup(false)}
              className="mt-6 w-full"
              size="lg"
            >
              Finish Setup ✓
            </Button>

            <button
              onClick={() => finishSetup(true)}
              className="mt-3 text-center text-[13px] text-text-muted transition-colors hover:text-white"
            >
              Skip for now
            </button>

            {activeGoal && (
              <p className="mt-4 text-center text-xs text-text-secondary">
                Goal selected: <span className="text-white">{activeGoal.title}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
