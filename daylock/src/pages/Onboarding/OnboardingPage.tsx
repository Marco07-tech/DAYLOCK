import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sunrise } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import { formatTo24Hour, formatTo12Hour } from '../../lib/utils'

type Step = 1 | 2 | 3
type Goal = 'cut' | 'bulk' | 'maintain' | null

const GOALS: Array<{
  value: Exclude<Goal, null>
  emoji: string
  title: string
  subtitle: string
}> = [
  { value: 'cut', emoji: '🔥', title: 'Cut', subtitle: 'Lose fat, get lean' },
  { value: 'bulk', emoji: '💪', title: 'Bulk', subtitle: 'Build muscle, gain size' },
  { value: 'maintain', emoji: '⚖️', title: 'Maintain', subtitle: 'Stay consistent, keep balance' },
]

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function parseTimeToMinutes(input: string): number | null {
  const value = input.trim().toLowerCase()
  if (!value) return null

  const match = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (!match) return null

  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2] ?? '0', 10)
  const period = match[3]

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59 || hours < 1 || hours > 12) {
    return null
  }

  if (period === 'pm' && hours !== 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0

  return (hours * 60) + minutes
}

function getSleepSummary(wakeTime: string, sleepTime: string) {
  const wake = parseTimeToMinutes(wakeTime)
  const sleep = parseTimeToMinutes(sleepTime)

  if (wake === null || sleep === null) {
    return null
  }

  let duration = wake - sleep
  if (duration <= 0) {
    duration += 24 * 60
  }

  const hours = duration / 60
  const formattedHours = hours.toFixed(1).replace('.0', '')

  if (hours >= 7) {
    return {
      label: `That's ${formattedHours} hours of sleep`,
      subtext: '✓ Optimal!',
      color: '#A8FF3E',
    }
  }

  if (hours >= 5) {
    return {
      label: `That's ${formattedHours} hours of sleep`,
      subtext: '⚠ Try for 7+ hours',
      color: '#F59E0B',
    }
  }

  return {
    label: `That's ${formattedHours} hours of sleep`,
    subtext: '❌ Too little sleep',
    color: '#EF4444',
  }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted)

  const [step, setStep] = useState<Step>(1)
  const [stepClass, setStepClass] = useState('step-enter')
  const [name, setName] = useState(user?.name || '')
  const [goal, setGoal] = useState<Goal>(null)
  const [wakeTime, setWakeTime] = useState('')
  const [sleepTime, setSleepTime] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)
  const loadTasks = useTaskStore((state) => state.loadTasks)

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
  }, [navigate, user])

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

  const changeStep = (nextStep: Step) => {
    if (nextStep === step) return

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
    }

    setStepClass('step-exit')
    transitionTimerRef.current = setTimeout(() => {
      setStep(nextStep)
      setStepClass('step-enter')
    }, 200)
  }

  const finishOnboarding = async () => {
    if (isFinishing) return
    setIsFinishing(true)
    setFinishError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          goal: goal ?? null,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (error) {
        setFinishError('Could not save your profile. Please try again.')
        if (import.meta.env.DEV) {
          console.error('Profile update error:', error)
        }
        return
      }

      setUser({ ...user, name })
      setOnboardingCompleted(true)

      if (wakeTime && sleepTime) {
        const { error: taskError } = await supabase.from('tasks').insert({
          user_id: user.id,
          type: 'sleep',
          name: `Sleep by ${sleepTime}`,
          icon: 'moon',
          meta: `Wake: ${wakeTime} · Bed: ${sleepTime}`,
          scheduled_days: ALL_DAYS,
          scheduled_time: sleepTime,
          streak: 0,
          done: false,
        })

        if (taskError && import.meta.env.DEV) {
          console.error('Sleep task error:', taskError)
        } else {
          await loadTasks(user.id)
        }
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFinishError('Something went wrong. Please try again.')
      if (import.meta.env.DEV) {
        console.error('Onboarding error:', err)
      }
    } finally {
      setIsFinishing(false)
    }
  }

  const sleepSummary = getSleepSummary(wakeTime, sleepTime)

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-6 py-6 page-enter">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        {step === 1 && (
          <div className={`flex flex-1 flex-col ${stepClass}`}>
            <div className="mt-2">
              <h1 className="font-display text-[28px] text-[#A8FF3E]">DayLock 👋</h1>
              <p className="mt-2 text-[14px] text-[#8B8B9E]">Let's set up your routine</p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#2A2A35] bg-[#1A1A24] p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#A8FF3E] bg-[rgba(168,255,62,0.1)]">
                <span className="font-display text-[24px] text-[#A8FF3E]">
                  {(name.trim().charAt(0) || user.name.charAt(0) || 'U').toUpperCase()}
                </span>
              </div>

              <p className="mt-5 text-center text-[12px] text-[#8B8B9E]">What should we call you?</p>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-3 w-full rounded-xl border border-[#2A2A35] bg-[#0A0A0F] px-4 py-3 text-center text-[16px] text-white outline-none transition-colors focus:border-[#A8FF3E]"
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {[1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`h-[6px] rounded-full transition-all ${dot === 1 ? 'w-5 bg-[#A8FF3E]' : 'w-[6px] bg-[#4A4A5A]'}`}
                />
              ))}
            </div>

            <Button
              onClick={() => changeStep(2)}
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
              type="button"
              onClick={() => changeStep(1)}
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A35] text-white transition-colors hover:border-[#A8FF3E]"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="font-display text-[22px] text-white">What's your goal? 💪</h2>
            <p className="mt-2 text-[14px] text-[#8B8B9E]">Personalizes your experience</p>

            <div className="mt-6 space-y-3">
              {GOALS.map((goalItem) => {
                const isSelected = goal === goalItem.value
                return (
                  <button
                    key={goalItem.value}
                    type="button"
                    onClick={() => setGoal(goalItem.value)}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-[#A8FF3E] bg-[rgba(168,255,62,0.1)]'
                        : 'border-[#2A2A35] bg-[#1A1A24]'
                    }`}
                  >
                    <span className="text-[32px] leading-none">{goalItem.emoji}</span>
                    <div>
                      <p className={`font-display text-[18px] font-semibold ${isSelected ? 'text-[#A8FF3E]' : 'text-white'}`}>
                        {goalItem.title}
                      </p>
                      <p className="text-[13px] text-[#8B8B9E]">{goalItem.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <Button
              onClick={() => changeStep(3)}
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
              type="button"
              onClick={() => changeStep(2)}
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A35] text-white transition-colors hover:border-[#A8FF3E]"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="font-display text-[22px] text-white">Sleep schedule 😴</h2>
            <p className="mt-2 text-[14px] text-[#8B8B9E]">We'll track your sleep habit</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-[#2A2A35] bg-[#1A1A24] p-5">
                <div className="flex items-center gap-2">
                  <Sunrise size={24} color="#A8FF3E" />
                  <p className="text-[12px] text-[#8B8B9E]">Wake up time</p>
                </div>
                <input
                  type="time"
                  value={formatTo24Hour(wakeTime)}
                  onChange={(event) => setWakeTime(formatTo12Hour(event.target.value))}
                  className="mt-4 w-full border-b-2 border-[#2A2A35] bg-transparent pb-2 text-center font-display text-[28px] text-white outline-none transition-colors focus:border-[#A8FF3E]"
                />
              </div>

              <div className="rounded-2xl border border-[#2A2A35] bg-[#1A1A24] p-5">
                <div className="flex items-center gap-2">
                  <Moon size={24} color="#8B8B9E" />
                  <p className="text-[12px] text-[#8B8B9E]">Bedtime</p>
                </div>
                <input
                  type="time"
                  value={formatTo24Hour(sleepTime)}
                  onChange={(event) => setSleepTime(formatTo12Hour(event.target.value))}
                  className="mt-4 w-full border-b-2 border-[#2A2A35] bg-transparent pb-2 text-center font-display text-[28px] text-white outline-none transition-colors focus:border-[#A8FF3E]"
                />
              </div>
            </div>

            {sleepSummary && (
              <div className="mt-4 rounded-xl border border-[#2A2A35] bg-[#1A1A24] p-4 text-center page-enter">
                <p className="text-[14px] font-medium" style={{ color: sleepSummary.color }}>{sleepSummary.label}</p>
                <p className="mt-1 text-[12px]" style={{ color: sleepSummary.color }}>{sleepSummary.subtext}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => !isFinishing && finishOnboarding()}
              disabled={isFinishing}
              className="mt-5 mb-3 text-center text-[13px] text-[#4A4A5A] transition-colors hover:text-white disabled:opacity-50"
            >
              Skip for now
            </button>

            {finishError && (
              <p className="mb-3 text-center text-sm text-status-danger">{finishError}</p>
            )}

            <Button
              onClick={() => finishOnboarding()}
              className="w-full"
              size="lg"
              isLoading={isFinishing}
              disabled={isFinishing}
            >
              {isFinishing ? 'Setting up...' : 'Finish Setup ✓'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
