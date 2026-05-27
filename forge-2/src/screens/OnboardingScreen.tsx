import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { FormInput } from '@/components/forms/FormInput'
import { FormButton } from '@/components/forms/FormButton'
import { ChevronLeft } from 'lucide-react'

type Goal = 'cutting' | 'bulking' | 'maintenance'
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderate' | 'active' | 'very_active'

interface OnboardingData {
  name: string
  age: number | ''
  weight_kg: number | ''
  height_cm: number | ''
  goal: Goal | null
  activity_level: ActivityLevel | null
}

const STEPS = [
  { title: "What's your name?", number: 1 },
  { title: 'How old are you?', number: 2 },
  { title: 'Your body stats', number: 3 },
  { title: "What's your goal?", number: 4 },
  { title: 'Activity level?', number: 5 },
]

const GOALS = [
  { id: 'cutting', label: 'Cutting', description: 'lose fat', emoji: '🔥' },
  { id: 'bulking', label: 'Bulking', description: 'build muscle', emoji: '💪' },
  { id: 'maintenance', label: 'Maintenance', description: 'stay fit', emoji: '⚡' },
]

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { id: 'lightly_active', label: 'Lightly Active', description: '1-3 days/week' },
  { id: 'moderate', label: 'Moderate', description: '3-5 days/week' },
  { id: 'active', label: 'Active', description: '6-7 days/week' },
  { id: 'very_active', label: 'Very Active', description: 'Intense exercise' },
]

export function OnboardingScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<OnboardingData>({
    name: user?.name || '',
    age: '',
    weight_kg: '',
    height_cm: '',
    goal: null,
    activity_level: null,
  })

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0
      case 1:
        return formData.age !== '' && Number(formData.age) >= 10 && Number(formData.age) <= 80
      case 2:
        return formData.weight_kg !== '' && formData.height_cm !== ''
      case 3:
        return formData.goal !== null
      case 4:
        return formData.activity_level !== null
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      await handleComplete()
    } else {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleComplete = async () => {
    if (!user?.id) {
      setError('User not found')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { error: supabaseError } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            name: formData.name,
            age: formData.age,
            weight_kg: formData.weight_kg,
            height_cm: formData.height_cm,
            goal: formData.goal,
            activity_level: formData.activity_level,
            onboarding_complete: true,
          },
          { onConflict: 'id' }
        )

      if (supabaseError) throw supabaseError

      // Update Zustand store with name
      useAuthStore.setState({
        user: {
          ...user,
          name: formData.name,
        },
      })

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      setError(message)
      console.error('Onboarding error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Header with back button and progress */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="p-2 rounded-lg enabled:hover:bg-[var(--color-surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--color-foreground)]" />
          </button>
          <span className="text-sm font-medium text-[var(--color-muted)]">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-[var(--color-surface)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-5 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Step 1: Name */}
            {currentStep === 0 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                    {STEPS[0].title}
                  </h1>
                  <p className="text-[var(--color-muted)]">
                    This helps us personalize your experience
                  </p>
                </div>
                <FormInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Age */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                    {STEPS[1].title}
                  </h1>
                  <p className="text-[var(--color-muted)]">
                    We use this to calculate your fitness metrics
                  </p>
                </div>
                <FormInput
                  label="Age"
                  type="number"
                  min="10"
                  max="80"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                  placeholder="Enter your age"
                  autoFocus
                />
              </div>
            )}

            {/* Step 3: Body Stats */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                    {STEPS[2].title}
                  </h1>
                  <p className="text-[var(--color-muted)]">
                    Help us understand your current fitness level
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Weight (kg)"
                    type="number"
                    min="30"
                    max="300"
                    value={formData.weight_kg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight_kg: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    placeholder="70"
                  />
                  <FormInput
                    label="Height (cm)"
                    type="number"
                    min="100"
                    max="250"
                    value={formData.height_cm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height_cm: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    placeholder="180"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Goal */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                    {STEPS[3].title}
                  </h1>
                  <p className="text-[var(--color-muted)]">
                    Pick what matters most to you
                  </p>
                </div>
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <motion.button
                      key={goal.id}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          goal: goal.id as Goal,
                        })
                      }
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        formData.goal === goal.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{goal.emoji}</span>
                        <div className="text-left flex-1">
                          <p className="text-lg font-semibold text-[var(--color-foreground)]">
                            {goal.label}
                          </p>
                          <p className="text-sm text-[var(--color-muted)]">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Activity Level */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                    {STEPS[4].title}
                  </h1>
                  <p className="text-[var(--color-muted)]">
                    Help us tailor your workout plan
                  </p>
                </div>
                <div className="space-y-3">
                  {ACTIVITY_LEVELS.map((level) => (
                    <motion.button
                      key={level.id}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          activity_level: level.id as ActivityLevel,
                        })
                      }
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        formData.activity_level === level.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                      }`}
                    >
                      <p className="font-semibold text-[var(--color-foreground)]">
                        {level.label}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {level.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with buttons */}
      <div className="px-5 pb-6 pt-4 space-y-3">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <FormButton
          onClick={handleNext}
          disabled={!isStepValid() || saving}
          loading={saving}
          className="w-full"
          size="lg"
        >
          {currentStep === STEPS.length - 1 ? 'Get Started!' : 'Continue'}
        </FormButton>
      </div>
    </div>
  )
}
