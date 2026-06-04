import { useState } from 'react'
import type { TaskType, Task } from '../../types'
import { TYPE_ICONS, TYPE_NAMES } from '../../constants/taskTypes'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import { useGymStore } from '../../store/useGymStore'
import { GymQuestions } from './components/GymQuestions'
import { StudyQuestions } from './components/StudyQuestions'
import { WaterQuestions } from './components/WaterQuestions'
import { SleepQuestions } from './components/SleepQuestions'
import { CustomQuestions } from './components/CustomQuestions'
import { StepsQuestions } from './components/StepsQuestions'

interface AddTaskSheetProps {
  open: boolean
  onClose: () => void
}

const TYPE_LIST: { type: TaskType; icon: string }[] = [
  { type: 'sleep', icon: 'bedtime' },
  { type: 'water', icon: 'water_drop' },
  { type: 'gym', icon: 'fitness_center' },
  { type: 'study', icon: 'menu_book' },
  { type: 'custom', icon: 'star' },
]


export function AddTaskSheet({ open, onClose }: AddTaskSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<TaskType | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const user = useAuthStore((state) => state.user)
  const addTask = useTaskStore((state) => state.addTask)
  const initTodayWorkout = useGymStore((state) => state.initTodayWorkout)

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep(1)
      setSelectedType(null)
      setFormData({})
    }, 350)
  }

  const handleAddTask = async () => {
    if (!selectedType || !user) return

    let taskName = TYPE_NAMES[selectedType]
    if (selectedType === 'study' && formData.subject) {
      taskName = `Study — ${formData.subject}`
    } else if (selectedType === 'water' && formData.target) {
      taskName = `Water (${formData.target})`
    } else if (selectedType === 'sleep' && formData.bedtime) {
      taskName = `Sleep by ${formData.bedtime}`
    } else if (selectedType === 'steps') {
      taskName = '10,000 steps today'
    } else if (selectedType === 'custom' && formData.name) {
      taskName = formData.name
    }

    const meta: Record<string, unknown> = {}
    if (formData.time) meta.time = formData.time
    if (formData.goal) meta.goal = formData.goal
    if (formData.duration) meta.duration = formData.duration
    if (formData.target) meta.target = formData.target
    if (formData.bedtime) meta.bedtime = formData.bedtime
    if (formData.wakeTime) meta.wakeTime = formData.wakeTime

    let scheduledDays = formData.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const newTask: Omit<Task, 'id' | 'streak' | 'done'> = {
      type: selectedType,
      name: taskName,
      icon: selectedType,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
      scheduledDays,
      scheduledTime: formData.time || formData.bedtime || '',
    }

    await addTask(newTask, user.id)

    if (selectedType === 'gym') {
      await initTodayWorkout(user.id)
    }

    handleClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(26,26,26,0.4)] backdrop-blur-[4px] z-50 flex items-end" onClick={handleClose}>
        <div
          className="w-full bg-background rounded-t-[32px] px-container-padding pt-6 pb-8 shadow-sheet max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-stack-gap-lg">
            <div className="w-12 h-1.5 bg-surface-variant rounded-full" />
          </div>

          {/* Header */}
          <h2 className="font-headline-sm text-headline-sm text-on-surface text-center mb-2">New Habit</h2>
          <p className="font-label-md text-label-md text-on-surface-variant text-center mb-stack-gap-lg">
            {step === 1 ? 'What will you focus on today?' :
             step === 2 ? 'Tell us more' :
             'Confirm your habit'}
          </p>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-stack-gap-lg">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  s <= step ? 'bg-primary' : 'bg-outline-variant'
                }`}
                style={{ width: s === step ? '24px' : '6px' }}
              />
            ))}
          </div>

          {/* Step 1: Type Picker */}
          {step === 1 && (
            <div className="space-y-stack-gap-lg">
              <div className="flex justify-between px-2">
                {TYPE_LIST.map(({ type, icon }) => (
                  <div key={type} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setSelectedType(type)}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      selectedType === type
                        ? 'bg-primary text-on-primary shadow-md scale-110'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-primary hover:text-on-primary'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">{icon}</span>
                    </div>
                    <span className={`font-label-sm text-label-sm ${selectedType === type ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {TYPE_NAMES[type]}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setStep(2); }}
                disabled={!selectedType}
                className="w-full py-5 bg-primary text-on-primary rounded-full font-label-md text-[16px] hover:opacity-90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && selectedType && (
            <div className="space-y-6">
              {selectedType === 'gym' && <GymQuestions formData={formData} setFormData={setFormData} />}
              {selectedType === 'study' && <StudyQuestions formData={formData} setFormData={setFormData} />}
              {selectedType === 'water' && <WaterQuestions formData={formData} setFormData={setFormData} />}
              {selectedType === 'sleep' && <SleepQuestions formData={formData} setFormData={setFormData} />}
              {selectedType === 'cardio' && <GymQuestions formData={formData} setFormData={setFormData} />}
              {selectedType === 'steps' && <StepsQuestions formData={formData} setFormData={setFormData} />}
              {selectedType === 'custom' && <CustomQuestions formData={formData} setFormData={setFormData} />}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-full border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 rounded-full bg-primary text-on-primary font-label-md hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedType && (
            <div className="space-y-6">
              <div className="bg-surface-container-low rounded-xl p-6 card-shadow text-center">
                <div className="flex justify-center mb-3">
                  {TYPE_ICONS[selectedType]}
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {selectedType === 'study' && formData.subject
                    ? `Study — ${formData.subject}`
                    : selectedType === 'water' && formData.target
                    ? `Water (${formData.target})`
                    : selectedType === 'sleep' && formData.bedtime
                    ? `Sleep by ${formData.bedtime}`
                    : selectedType === 'custom' && formData.name
                    ? formData.name
                    : TYPE_NAMES[selectedType]}
                </h3>
                <div className="mt-4 space-y-1 font-label-sm text-label-sm text-on-surface-variant">
                  {selectedType === 'gym' && formData.days?.length && (
                    <p>{(formData.days as string[]).join(', ')}</p>
                  )}
                  {selectedType === 'steps' && formData.days?.length && (
                    <p>{(formData.days as string[]).join(', ')}</p>
                  )}
                  {selectedType === 'study' && formData.duration && (
                    <p>{formData.duration}/day</p>
                  )}
                  {selectedType === 'water' && formData.target && (
                    <p>Daily: {formData.target}</p>
                  )}
                  {selectedType === 'sleep' && (
                    <p>{formData.bedtime} → {formData.wakeTime}</p>
                  )}
                  {formData.time && (
                    <p>at {formData.time}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-full border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors"
                >
                  ← Edit
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 py-4 rounded-full bg-primary text-on-primary font-label-md hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
                >
                  Add to Routine ✓
                </button>
              </div>
            </div>
          )}

          {/* Cancel */}
          <button
            onClick={handleClose}
            className="w-full py-4 text-on-surface-variant font-label-md hover:text-primary transition-colors mt-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
