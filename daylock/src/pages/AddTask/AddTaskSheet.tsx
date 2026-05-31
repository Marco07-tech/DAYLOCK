import { useState } from 'react'
import { X } from 'lucide-react'
import { Dumbbell, BookOpen, Droplet, Moon, Activity, Star } from 'lucide-react'
import type { TaskType, Task } from '../../types'
import { useAuthStore } from '../../store/useAuthStore'
import { useTaskStore } from '../../store/useTaskStore'
import { useGymStore } from '../../store/useGymStore'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { TaskTypePicker } from './components/TaskTypePicker'
import { GymQuestions } from './components/GymQuestions'
import { StudyQuestions } from './components/StudyQuestions'
import { WaterQuestions } from './components/WaterQuestions'
import { SleepQuestions } from './components/SleepQuestions'
import { CustomQuestions } from './components/CustomQuestions'

const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  gym: <Dumbbell size={32} className="text-accent-lime" />,
  study: <BookOpen size={32} className="text-accent-lime" />,
  water: <Droplet size={32} className="text-accent-lime" />,
  sleep: <Moon size={32} className="text-accent-lime" />,
  cardio: <Activity size={32} className="text-accent-lime" />,
  custom: <Star size={32} className="text-accent-lime" />,
}

const TYPE_NAMES: Record<TaskType, string> = {
  gym: 'Gym',
  study: 'Study',
  water: 'Water',
  sleep: 'Sleep',
  cardio: 'Cardio',
  custom: 'Custom',
}

interface AddTaskSheetProps {
  open: boolean
  onClose: () => void
}

export function AddTaskSheet({ open, onClose }: AddTaskSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<TaskType | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const user = useAuthStore((state) => state.user)
  const addTask = useTaskStore((state) => state.addTask)
  const initTodayWorkout = useGymStore((state) => state.initTodayWorkout)

  const handleClose = () => {
    onClose()
    // Reset state after animation
    setTimeout(() => {
      setStep(1)
      setSelectedType(null)
      setFormData({})
    }, 350)
  }

  const handleAddTask = async () => {
    if (!selectedType || !user) return

    // Build task name
    let taskName = TYPE_NAMES[selectedType]
    if (selectedType === 'study' && formData.subject) {
      taskName = `Study — ${formData.subject}`
    } else if (selectedType === 'water' && formData.target) {
      taskName = `Water (${formData.target})`
    } else if (selectedType === 'sleep' && formData.bedtime) {
      taskName = `Sleep by ${formData.bedtime}`
    } else if (selectedType === 'custom' && formData.name) {
      taskName = formData.name
    }

    // Build meta object
    const meta: Record<string, unknown> = {}
    if (formData.time) meta.time = formData.time
    if (formData.goal) meta.goal = formData.goal
    if (formData.duration) meta.duration = formData.duration
    if (formData.target) meta.target = formData.target
    if (formData.bedtime) meta.bedtime = formData.bedtime
    if (formData.wakeTime) meta.wakeTime = formData.wakeTime

    // Build scheduled days
    let scheduledDays = formData.days || []
    if (selectedType === 'water' || selectedType === 'sleep') {
      scheduledDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }

    // Create task object (without id - Supabase will generate it)
    const newTask: Omit<Task, 'id' | 'streak' | 'done'> = {
      type: selectedType,
      name: taskName,
      icon: selectedType,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
      scheduledDays,
      scheduledTime: formData.time || formData.bedtime || '',
    }

    // Add task to store
    await addTask(newTask, user.id)

    // If gym task, initialize today's workout
    if (selectedType === 'gym') {
      await initTodayWorkout(user.id)
    }

    handleClose()
  }
  

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black z-40 transition-opacity duration-350"
        style={{ opacity: open ? 0.7 : 0 }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-bg-border rounded-t-3xl z-50 flex flex-col max-h-[85vh] overflow-y-auto transition-transform duration-350 ease-out"
        style={{
          transform: open ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-bg-border">
          <h2 className="text-text-primary font-semibold text-base">
            {step === 1 && 'What do you want to track?'}
            {step === 2 && 'Tell us more'}
            {step === 3 && 'Confirm habit'}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-1 py-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 rounded-full transition-all duration-200',
                s <= step
                  ? 'bg-accent-lime'
                  : 'bg-bg-border'
              )}
              style={{
                width: s === step ? '20px' : '6px',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-6">
          {/* Step 1: Task Type Picker */}
          {step === 1 && (
            <div className="space-y-6">
              <TaskTypePicker
                selectedType={selectedType}
                onSelect={(type: TaskType) => setSelectedType(type)}
              />
              <Button
                variant="primary"
                className="w-full"
                disabled={!selectedType}
                onClick={() => setStep(2)}
              >
                Next →
              </Button>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && selectedType && (
            <div className="space-y-6">
              {selectedType === 'gym' && (
                <GymQuestions formData={formData} setFormData={setFormData} />
              )}
              {selectedType === 'study' && (
                <StudyQuestions formData={formData} setFormData={setFormData} />
              )}
              {selectedType === 'water' && (
                <WaterQuestions formData={formData} setFormData={setFormData} />
              )}
              {selectedType === 'sleep' && (
                <SleepQuestions formData={formData} setFormData={setFormData} />
              )}
              {selectedType === 'cardio' && (
                <GymQuestions formData={formData} setFormData={setFormData} />
              )}
              {selectedType === 'custom' && (
                <CustomQuestions formData={formData} setFormData={setFormData} />
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setStep(3)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedType && (
            <div className="space-y-6">
              {/* Summary card */}
              <div className="bg-bg-card border border-accent-lime border-opacity-20 rounded-2xl p-5 text-center">
                <div className="flex justify-center mb-3">
                  {TYPE_ICONS[selectedType]}
                </div>

                {/* Task name */}
                <h3 className="text-text-primary font-semibold text-base">
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

                {/* Meta info */}
                <div className="mt-3 space-y-1">
                  {selectedType === 'gym' && formData.days?.length && (
                    <>
                      <p className="text-text-secondary text-sm">
                        {(formData.days as string[]).join(', ')}
                      </p>
                      {formData.time && (
                        <p className="text-text-secondary text-sm">{formData.time}</p>
                      )}
                      {formData.goal && (
                        <div className="flex justify-center mt-2">
                          <span className="text-accent-lime text-xs font-medium bg-accent-lime-muted px-2 py-1 rounded">
                            {formData.goal}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedType === 'study' && (
                    <>
                      {formData.duration && (
                        <p className="text-text-secondary text-sm">{formData.duration}/day</p>
                      )}
                      {formData.time && (
                        <p className="text-text-secondary text-sm">{formData.time}</p>
                      )}
                    </>
                  )}
                  {selectedType === 'water' && formData.target && (
                    <p className="text-text-secondary text-sm">Daily: {formData.target}</p>
                  )}
                  {selectedType === 'sleep' && (
                    <>
                      <p className="text-text-secondary text-sm">
                        {formData.bedtime} → {formData.wakeTime}
                      </p>
                    </>
                  )}
                  {selectedType === 'cardio' && (
                    <>
                      {formData.days?.length && (
                        <p className="text-text-secondary text-sm">
                          {(formData.days as string[]).join(', ')}
                        </p>
                      )}
                      {formData.time && (
                        <p className="text-text-secondary text-sm">{formData.time}</p>
                      )}
                    </>
                  )}
                  {selectedType === 'custom' && (
                    <>
                      {formData.days?.length && (
                        <p className="text-text-secondary text-sm">
                          {(formData.days as string[]).join(', ')}
                        </p>
                      )}
                      {formData.time && (
                        <p className="text-text-secondary text-sm">{formData.time}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  ← Edit
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleAddTask}
                >
                  Add to Routine ✓
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
