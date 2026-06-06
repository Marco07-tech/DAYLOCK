import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import { useGymStore } from '../../store/useGymStore'
import { formatTo24Hour, formatTo12Hour, parseTimeToMinutes } from '../../lib/utils'

type Step = 1 | 2 | 3 | 4 | 5 | 6
type Goal = 'cut' | 'bulk' | 'maintain' | null
type GymLevel = 'beginner' | 'experienced'
type BeginnerSplitName = 'Push / Pull / Legs' | 'Full Body' | 'Upper / Lower'

interface BeginnerSplitOption {
  name: BeginnerSplitName
  days: string
  description: string
  schedule: Record<string, string>
  icon: string
}

const GOALS: Array<{
  value: Exclude<Goal, null> | 'general'
  title: string
  description: string
}> = [
  { value: 'cut', title: 'Cutting', description: 'Shed fat while preserving muscle' },
  { value: 'bulk', title: 'Bulking', description: 'Build muscle and increase mass' },
  { value: 'maintain', title: 'Maintenance', description: 'Stay consistent, keep balance' },
  { value: 'general', title: 'General Fitness', description: 'Feel better, move better' },
]

const BEGINNER_SPLITS: BeginnerSplitOption[] = [
  {
    name: 'Push / Pull / Legs',
    days: '3 days/week',
    description: 'Classic beginner split. Build strength evenly.',
    schedule: { Monday: 'Push', Wednesday: 'Pull', Friday: 'Legs' },
    icon: 'repeat',
  },
  {
    name: 'Full Body',
    days: '3 days/week',
    description: 'Train everything each session. Great for beginners.',
    schedule: { Monday: 'Full Body', Wednesday: 'Full Body', Friday: 'Full Body' },
    icon: 'accessibility_new',
  },
  {
    name: 'Upper / Lower',
    days: '4 days/week',
    description: 'Balanced upper and lower body focus.',
    schedule: { Monday: 'Upper', Tuesday: 'Lower', Thursday: 'Upper', Friday: 'Lower' },
    icon: 'swap_vert',
  },
]

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getSleepSummary(wakeTime: string, sleepTime: string) {
  const wake = parseTimeToMinutes(wakeTime)
  const sleep = parseTimeToMinutes(sleepTime)
  if (wake === null || sleep === null) return null
  let duration = wake - sleep
  if (duration <= 0) duration += 24 * 60
  const hours = duration / 60
  const formattedHours = hours.toFixed(1).replace('.0', '')
  if (hours >= 7) return { label: `That's ${formattedHours} hours of sleep`, subtext: '✓ Optimal!', color: '#516051' }
  if (hours >= 5) return { label: `That's ${formattedHours} hours of sleep`, subtext: '⚠ Try for 7+ hours', color: '#747872' }
  return { label: `That's ${formattedHours} hours of sleep`, subtext: '❌ Too little sleep', color: '#ba1a1a' }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const setGymLevel = useGymStore((state) => state.setGymLevel)
  const loadGymSplit = useGymStore((state) => state.loadGymSplit)

  const [step, setStep] = useState<Step>(1)
  const [stepClass, setStepClass] = useState('step-enter')
  const [name, setName] = useState(user?.name || '')
  const [goal, setGoal] = useState<Goal>(null)
  const [gymLevel, setGymLevelState] = useState<GymLevel | null>(null)
  const [selectedSplit, setSelectedSplit] = useState<BeginnerSplitName | null>(null)
  const [wakeTime, setWakeTime] = useState('')
  const [sleepTime, setSleepTime] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isBeginner = gymLevel === 'beginner'
  const isExperienced = gymLevel === 'experienced'

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [navigate, user])

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    }
  }, [])

  if (!user) return null

  const changeStep = (target: Step) => {
    if (target === step) return
    let nextStep = target
    if (nextStep > step && isExperienced) {
      if (nextStep === 4) nextStep = 5 as Step
    }
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    setStepClass('step-exit')
    transitionTimerRef.current = setTimeout(() => {
      setStep(nextStep)
      setStepClass('step-enter')
    }, 200)
  }

  const totalSteps = isBeginner ? 6 : 5
  const stepsBetween = (from: Step, to: Step) => {
    const arr: Step[] = []
    for (let i = from; i <= to; i++) arr.push(i as Step)
    return arr
  }

  const finishOnboarding = async () => {
    if (isFinishing) return
    setIsFinishing(true)
    setFinishError(null)
    try {
      const updatePayload: Record<string, unknown> = {
        name,
        goal: goal ?? null,
        gym_level: gymLevel,
        onboarding_completed: true,
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (error) {
        setFinishError('Could not save your profile. Please try again.')
        if (import.meta.env.DEV) console.error('Profile update error:', error)
        setIsFinishing(false)
        return
      }

      // Save beginner split if applicable
      if (isBeginner && selectedSplit) {
        const splitOption = BEGINNER_SPLITS.find((s) => s.name === selectedSplit)
        if (splitOption) {
          const splitInserts = Object.entries(splitOption.schedule).map(([day, splitName]) => ({
            user_id: user.id,
            day_name: day,
            split_name: splitName,
          }))

          // Set rest days to Rest
          const restDays = ALL_DAYS.filter((d) => !splitOption.schedule[d])
          restDays.forEach((day) => {
            splitInserts.push({
              user_id: user.id,
              day_name: day,
              split_name: 'Rest',
            })
          })

          const { error: splitError } = await supabase
            .from('gym_splits')
            .upsert(splitInserts, { onConflict: 'user_id,day_name' })

          if (splitError && import.meta.env.DEV) {
            console.error('Split save error:', splitError)
          }
        }
      }

      setGymLevel(gymLevel)
      setUser({ ...user, name })
      setOnboardingCompleted(true)

      // Reload gym split after saving
      if (isBeginner) {
        try {
          await loadGymSplit(user.id)
        } catch (e) {
          if (import.meta.env.DEV) console.error('Reload split error:', e)
        }
      }

      try {
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
          if (taskError && import.meta.env.DEV) console.error('Sleep task error:', taskError)
        }
        await loadTasks(user.id)
        navigate('/dashboard', { replace: true })
      } catch (loadErr) {
        setFinishError('Data failed to load. Please try again.')
        if (import.meta.env.DEV) console.error('Onboarding load error:', loadErr)
      }
    } catch (err) {
      setFinishError('Something went wrong. Please try again.')
      if (import.meta.env.DEV) console.error('Onboarding error:', err)
    } finally {
      setIsFinishing(false)
    }
  }

  const sleepSummary = getSleepSummary(wakeTime, sleepTime)

  const renderDots = (activeStep: Step) => {
    const dots = stepsBetween(1 as Step, totalSteps as Step)
    return (
      <div className="flex space-x-2">
        {dots.map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= activeStep
                ? 'bg-primary'
                : 'bg-outline-variant'
            }`}
            style={{ width: s === activeStep ? '24px' : '6px' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      {/* Slide 1: Welcome */}
      {step === 1 && (
        <div className={`flex flex-col items-center justify-center flex-1 w-full max-w-sm space-y-8 ${stepClass}`}>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-primary-fixed opacity-20 blur-[100px] rounded-full" />
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 max-w-[240px]">
              <line x1="20" y1="140" x2="180" y2="140" stroke="#516051" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M100 140C100 140 105 100 130 80C155 60 170 30 170 30" stroke="#516051" strokeWidth="1" strokeDasharray="4 4"/>
              <path d="M100 140C100 140 95 100 70 80C45 60 30 30 30 30" stroke="#516051" strokeWidth="1" strokeDasharray="4 4"/>
              <circle cx="100" cy="80" r="25" stroke="#516051" strokeWidth="1" fill="#fcf9f8"/>
              <circle cx="100" cy="80" r="12" fill="#516051" fillOpacity="0.1"/>
            </svg>
          </div>
          <div className="text-center space-y-3">
            <h1 className="font-display-lg-mobile italic text-display-lg-mobile leading-tight text-on-surface">
              Welcome to DayLock
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant whitespace-pre-line">
              Lock in your habits.{'\n'}Build your best self.
            </p>
          </div>
          {renderDots(1)}
          <div className="w-full space-y-3">
            <button
              onClick={() => changeStep(2)}
              className="w-full bg-primary text-on-primary py-4 px-8 rounded-full font-label-md shadow-sm active:scale-[0.98] transition-all"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors py-2"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      )}

      {/* Slide 2: Goal Selection */}
      {step === 2 && (
        <div className={`flex flex-col flex-1 w-full max-w-sm space-y-6 ${stepClass}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => changeStep(1)} className="p-1 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant">2 OF {totalSteps}</span>
          </div>
          <div>
            <h2 className="font-headline-md italic text-headline-md text-on-surface leading-tight">What's your focus?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">We'll personalize your targets.</p>
          </div>
          <div className="space-y-3 flex-1">
            {GOALS.map((goalItem) => {
              const isSelected = goal === goalItem.value || (goalItem.value === 'general' && goal === null)
              const effectiveSelected = goalItem.value === 'general' ? goal === null : isSelected
              return (
                <button
                  key={goalItem.value}
                  onClick={() => setGoal(goalItem.value === 'general' ? null : goalItem.value as Goal)}
                  className={`w-full text-left rounded-xl p-5 card-shadow transition-all active:scale-[0.98] relative ${
                    effectiveSelected
                      ? 'bg-primary-fixed/30 border-2 border-primary'
                      : 'bg-surface-container-low border-2 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                    effectiveSelected ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined">
                      {goalItem.value === 'cut' ? 'content_cut' :
                       goalItem.value === 'bulk' ? 'fitness_center' :
                       goalItem.value === 'maintain' ? 'balance' : 'auto_awesome'}
                    </span>
                  </div>
                  <p className="font-label-md text-label-md text-on-surface">{goalItem.title}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{goalItem.description}</p>
                  {effectiveSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => changeStep(3)}
            className="w-full bg-primary text-on-primary py-4 px-8 rounded-full font-label-md shadow-sm active:scale-[0.98] transition-all"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Slide 3: Gym Experience */}
      {step === 3 && (
        <div className={`flex flex-col flex-1 w-full max-w-sm space-y-6 ${stepClass}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => changeStep(2)} className="p-1 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant">3 OF {totalSteps}</span>
          </div>
          <div>
            <h2 className="font-headline-md italic text-headline-md text-on-surface leading-tight">
              Your gym experience?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 mb-8">
              We'll set things up accordingly.
            </p>
          </div>
          <div className="space-y-4 flex-1">
            <div
              onClick={() => setGymLevelState('beginner')}
              className={`relative rounded-2xl p-6 cursor-pointer border-2 transition-all active:scale-[0.98] ${
                gymLevel === 'beginner'
                  ? 'bg-primary-fixed/30 border-primary'
                  : 'bg-surface-container-low border-transparent card-shadow'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">emoji_people</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface">I'm a Beginner</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                Set up my splits and exercises automatically
              </p>
              {gymLevel === 'beginner' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                </div>
              )}
            </div>
            <div
              onClick={() => setGymLevelState('experienced')}
              className={`relative rounded-2xl p-6 cursor-pointer border-2 transition-all active:scale-[0.98] ${
                gymLevel === 'experienced'
                  ? 'bg-primary-fixed/30 border-primary'
                  : 'bg-surface-container-low border-transparent card-shadow'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface">I already train</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                I'll log my own exercises and set my own days
              </p>
              {gymLevel === 'experienced' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (isBeginner) changeStep(4)
              else if (isExperienced) changeStep(5)
            }}
            disabled={!gymLevel}
            className="w-full bg-primary text-on-primary py-4 px-8 rounded-full font-label-md shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Slide 4: Beginner Split Selection (only for beginners) */}
      {step === 4 && isBeginner && (
        <div className={`flex flex-col flex-1 w-full max-w-sm space-y-6 ${stepClass}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => changeStep(3)} className="p-1 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant">4 OF {totalSteps}</span>
          </div>
          <div>
            <h2 className="font-headline-md italic text-headline-md text-on-surface leading-tight">Choose your split</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 mb-8">
              We'll fill your workout plan automatically.
            </p>
          </div>
          <div className="space-y-4 flex-1">
            {BEGINNER_SPLITS.map((split) => (
              <div
                key={split.name}
                onClick={() => setSelectedSplit(split.name)}
                className={`relative rounded-2xl p-6 cursor-pointer border-2 transition-all active:scale-[0.98] ${
                  selectedSplit === split.name
                    ? 'bg-primary-fixed/30 border-primary'
                    : 'bg-surface-container-low border-transparent card-shadow'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined">{split.icon}</span>
                </div>
                <p className="font-label-md text-label-md text-on-surface">{split.name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{split.description}</p>
                <p className="font-label-sm text-label-sm text-primary mt-2">{split.days}</p>
                {selectedSplit === split.name && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => changeStep(5)}
            disabled={!selectedSplit}
            className="w-full bg-primary text-on-primary py-4 px-8 rounded-full font-label-md shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Slide 4 (experienced) / 5 (beginner): Sleep Schedule */}
      {(step === 4 || (step === 5 && isBeginner)) && (
        <div className={`flex flex-col flex-1 w-full max-w-sm space-y-6 ${stepClass}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => changeStep(isBeginner ? 4 : 3)} className="p-1 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {isBeginner ? '5' : '4'} OF {totalSteps}
            </span>
          </div>
          <div>
            <h2 className="font-headline-md italic text-headline-md text-on-surface leading-tight">Your sleep rhythm</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">We'll track this as a daily habit.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-low rounded-xl p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">sunny</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Wake up time</p>
              </div>
              <input
                type="time"
                value={formatTo24Hour(wakeTime)}
                onChange={(e) => setWakeTime(formatTo12Hour(e.target.value))}
                className="w-full border-b-2 border-outline-variant bg-transparent pb-2 text-center font-display-lg-mobile text-display-lg-mobile text-on-surface outline-none transition-colors focus:border-primary"
              />
            </div>
            <div className="bg-surface-container-low rounded-xl p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant">bedtime</span>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Bedtime</p>
              </div>
              <input
                type="time"
                value={formatTo24Hour(sleepTime)}
                onChange={(e) => setSleepTime(formatTo12Hour(e.target.value))}
                className="w-full border-b-2 border-outline-variant bg-transparent pb-2 text-center font-display-lg-mobile text-display-lg-mobile text-on-surface outline-none transition-colors focus:border-primary"
              />
            </div>
            {sleepSummary && (
              <div className="bg-surface-container-low rounded-xl p-4 text-center card-shadow page-enter">
                <p className="font-label-md text-label-md" style={{ color: sleepSummary.color }}>{sleepSummary.label}</p>
                <p className="font-label-sm text-label-sm mt-1" style={{ color: sleepSummary.color }}>{sleepSummary.subtext}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => changeStep(isBeginner ? 6 : 5)}
            className="w-full bg-primary text-on-primary py-4 px-8 rounded-full font-label-md shadow-sm active:scale-[0.98] transition-all"
          >
            Continue →
          </button>
          <button
            onClick={() => changeStep(isBeginner ? 6 : 5)}
            className="w-full font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Slide 5 (experienced) / 6 (beginner): Name + Finish */}
      {(step === 5 || step === 6) && (
        <div className={`flex flex-col flex-1 w-full max-w-sm space-y-6 ${stepClass}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => changeStep(isBeginner ? 5 : 4)} className="p-1 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {isBeginner ? '6' : '5'} OF {totalSteps}
            </span>
          </div>
          <div>
            <h2 className="font-headline-md italic text-headline-md text-on-surface leading-tight">A few details</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Help us tailor your daily plan.</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 card-shadow space-y-4">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">WHAT SHOULD WE CALL YOU?</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-transparent border-none p-0 font-display-lg-mobile text-display-lg-mobile text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none"
            />
          </div>
          <div className="bg-surface-container-low rounded-xl p-5 card-shadow flex items-start gap-4">
            <span className="material-symbols-outlined text-primary mt-0.5">auto_awesome</span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Based on your inputs:</p>
              <p className="font-label-md text-label-md text-on-surface">
                {goal ? `${goal.charAt(0).toUpperCase() + goal.slice(1)} focus` : 'General fitness'}
                {gymLevel === 'beginner' ? ' · Beginner plan' : gymLevel === 'experienced' ? ' · Experienced' : ''}
                {selectedSplit ? ` · ${selectedSplit}` : ''}
                {wakeTime && sleepTime ? ` · Sleep schedule set` : ''}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 mt-1">
                You can adjust all of this later in Settings.
              </p>
            </div>
          </div>
          {finishError && (
            <p className="font-label-sm text-label-sm text-error text-center">{finishError}</p>
          )}
          <button
            onClick={finishOnboarding}
            disabled={isFinishing || !name.trim()}
            className="w-full bg-primary text-on-primary py-4 px-8 rounded-full font-label-md shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isFinishing ? (
              <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Setting up...</>
            ) : (
              'Let\'s go 🔒'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
