import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'

type Step = 1 | 2 | 3 | 4
type FitnessGoal = 'cutting' | 'bulking' | 'maintenance' | null
type GymLevel = 'beginner' | 'experienced'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useAuthStore()
  const [step, setStep] = useState<Step>(1)
  const [goal, setGoal] = useState<FitnessGoal>(null)
  const [gymLevel, setGymLevel] = useState<GymLevel>('beginner')
  const [bodyWeight, setBodyWeight] = useState('')
  const [trainingDays, setTrainingDays] = useState<number[]>([0, 2, 4])
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleDay = (idx: number) => {
    setTrainingDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    )
  }

  const calorieGoal = bodyWeight ? Math.round(Number(bodyWeight) * 28) : 1800
  const proteinGoal = bodyWeight ? Math.round(Number(bodyWeight) * 2.2) : 160

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [step])

  const finishOnboarding = async () => {
    if (!profile) return
    await updateProfile({
      fitness_goal: goal ?? 'maintenance',
      gym_level: gymLevel,
      body_weight: bodyWeight ? Number(bodyWeight) : null,
      calorie_goal: calorieGoal,
      protein_goal: proteinGoal,
      onboarding_completed: true,
    })

    if (gymLevel === 'beginner') {
      const split = trainingDays.map((dayIdx) => ({
        user_id: profile.id,
        day_of_week: dayIdx,
        workout_name: 'Full Body',
        is_rest: false,
      }))
      for (const day of split) {
        await supabase.from('weekly_split').upsert(day, { onConflict: 'user_id,day_of_week' })
      }
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto" ref={contentRef}>
        <div className="page-enter px-md py-lg max-w-lg mx-auto w-full min-h-full flex flex-col">
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center items-center gap-8">
              <p className="font-display text-ff-accent uppercase text-2xl tracking-[0.2em] self-start">FORGEFIT</p>

              <div className="grid grid-cols-6 gap-px w-48 h-48 opacity-10">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>

              <div className="text-center">
                <h1 className="font-display text-4xl font-bold text-white leading-tight">Track your lifts.</h1>
                <h1 className="font-display text-4xl font-bold text-white leading-tight">Fuel your gains.</h1>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <div className="ff-pill flex items-center gap-3 px-4 py-3">
                  <span className="text-ff-accent font-bold">01</span>
                  <span className="tracking-widest">STRENGTH</span>
                </div>
                <div className="ff-pill flex items-center gap-3 px-4 py-3">
                  <span className="text-ff-accent font-bold">02</span>
                  <span className="tracking-widest">NUTRITION</span>
                </div>
                <div className="ff-pill flex items-center gap-3 px-4 py-3">
                  <span className="text-ff-accent font-bold">03</span>
                  <span className="tracking-widest">PRECISION</span>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="ff-btn-primary mt-auto">
                Get Started
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(1)} className="text-ff-muted">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="font-label-caps text-label-caps text-ff-muted tracking-widest">2 OF 4</span>
              </div>

              <h2 className="font-display text-3xl font-bold text-white mb-6">What's your goal?</h2>

              <div className="flex flex-col gap-3 flex-1">
                {(['cutting', 'bulking', 'maintenance'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`ff-card p-md text-left flex items-center justify-between transition-all ${
                      goal === g ? 'border-l-4 border-l-ff-accent' : ''
                    }`}
                  >
                    <div>
                      <p className={`font-body-lg font-bold ${goal === g ? 'text-ff-accent' : 'text-white'}`}>
                        {g === 'cutting' ? 'Cutting' : g === 'bulking' ? 'Bulking' : 'Maintenance'}
                      </p>
                      <p className="font-body-md text-ff-muted mt-1">
                        {g === 'cutting' ? 'Burn fat while preserving muscle' :
                         g === 'bulking' ? 'Build muscle and strength' :
                         'Maintain your current physique'}
                      </p>
                    </div>
                    {goal === g && (
                      <span className="material-symbols-outlined text-ff-accent">check_circle</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!goal}
                className={`ff-btn-primary mt-6 ${!goal ? 'opacity-40' : ''}`}
              >
                Continue
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(2)} className="text-ff-muted">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="font-label-caps text-label-caps text-ff-muted tracking-widest">3 OF 4</span>
              </div>

              <h2 className="font-display text-3xl font-bold text-white mb-6">A few details</h2>

              <div className="ff-card p-md mb-6">
                <p className="font-label-caps text-label-caps text-ff-muted mb-3">BODY WEIGHT</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                    placeholder="0"
                    className="font-display text-5xl font-bold text-white bg-transparent border-b-2 border-ff-border outline-none w-32 text-center focus:border-ff-accent transition-colors"
                  />
                  <span className="font-body-lg text-ff-muted">kg</span>
                </div>
              </div>

              <p className="font-label-caps text-label-caps text-ff-muted mb-3">TRAINING DAYS</p>
              <div className="flex gap-2 mb-6">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(i)}
                    className={`w-10 h-10 rounded-full font-label-caps text-label-caps transition-all ${
                      trainingDays.includes(i)
                        ? 'bg-ff-accent text-white'
                        : 'bg-surface-container text-ff-muted border border-ff-border'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="ff-card p-md">
                <p className="font-label-caps text-label-caps text-ff-accent mb-2">TARGET PROTOCOL</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-display text-3xl font-bold text-white">{calorieGoal}</p>
                    <p className="font-label-caps text-label-caps text-ff-muted">CALORIES</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-bold text-white">{proteinGoal}g</p>
                    <p className="font-label-caps text-label-caps text-ff-muted">PROTEIN</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(4)} className="ff-btn-primary mt-6">
                Continue
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(3)} className="text-ff-muted">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="font-label-caps text-label-caps text-ff-muted tracking-widest">4 OF 4</span>
              </div>

              <h2 className="font-display text-3xl font-bold text-white mb-2">Your gym experience?</h2>

              <div className="flex flex-col gap-3 flex-1">
                <button
                  onClick={() => setGymLevel('beginner')}
                  className={`ff-card p-md text-left relative transition-all ${
                    gymLevel === 'beginner' ? 'border-l-4 border-l-ff-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-body-lg font-bold ${gymLevel === 'beginner' ? 'text-ff-accent' : 'text-white'}`}>
                        I'm a Beginner
                      </p>
                      <p className="font-body-md text-ff-muted mt-1">
                        Set up my splits and exercises automatically
                      </p>
                    </div>
                    {gymLevel === 'beginner' && (
                      <span className="material-symbols-outlined text-ff-accent">check_circle</span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setGymLevel('experienced')}
                  className={`ff-card p-md text-left relative transition-all ${
                    gymLevel === 'experienced' ? 'border-l-4 border-l-ff-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-body-lg font-bold ${gymLevel === 'experienced' ? 'text-ff-accent' : 'text-white'}`}>
                        I already train
                      </p>
                      <p className="font-body-md text-ff-muted mt-1">
                        I'll log my own exercises and set my own days
                      </p>
                    </div>
                    {gymLevel === 'experienced' && (
                      <span className="material-symbols-outlined text-ff-accent">check_circle</span>
                    )}
                  </div>
                </button>
              </div>

              <button onClick={finishOnboarding} className="ff-btn-primary mt-6">
                Start Forging
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
