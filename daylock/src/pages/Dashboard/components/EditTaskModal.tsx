import { useState } from 'react'

import type { Task } from '../../../types'
import { TYPE_ICONS, TYPE_NAMES } from '../../../constants/taskTypes'
import { useAuthStore } from '../../../store/useAuthStore'
import { useTaskStore } from '../../../store/useTaskStore'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/Button'
import { GymQuestions } from '../../AddTask/components/GymQuestions'
import { StudyQuestions } from '../../AddTask/components/StudyQuestions'
import { WaterQuestions } from '../../AddTask/components/WaterQuestions'
import { SleepQuestions } from '../../AddTask/components/SleepQuestions'
import { CustomQuestions } from '../../AddTask/components/CustomQuestions'
import { StepsQuestions } from '../../AddTask/components/StepsQuestions'

interface EditTaskModalProps {
  open: boolean
  task: Task | null
  onClose: () => void
  onToast: (message: string, variant?: 'success' | 'error') => void
}

interface EditFormData {
  name?: string
  days?: string[]
  time?: string
  subject?: string
  duration?: string
  target?: string
  goal?: string
  bedtime?: string
  wakeTime?: string
}

export function EditTaskModal({ open, task, onClose, onToast }: EditTaskModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<EditFormData>({})
  const [saving, setSaving] = useState(false)

  const user = useAuthStore((state) => state.user)
  const updateTask = useTaskStore((state) => state.updateTask)

  // Initialize form data when task changes
  const handleOpen = () => {
    if (!task) return

    // Parse meta if it's a string
    let meta: Record<string, any> = {}
    if (typeof task.meta === 'string') {
      try {
        meta = JSON.parse(task.meta)
      } catch {
        meta = {}
      }
    } else if (task.meta) {
      meta = task.meta as Record<string, any>
    }

    // Extract fields based on task type
    const initial: EditFormData = {
      name: task.name,
      days: task.scheduledDays || [],
      time: task.scheduledTime || '',
    }

    if (task.type === 'gym') {
      initial.time = meta.time || task.scheduledTime || ''
      initial.goal = meta.goal || ''
      initial.days = task.scheduledDays || []
    } else if (task.type === 'study') {
      initial.subject = meta.subject || extractSubject(task.name)
      initial.duration = meta.duration || ''
      initial.time = meta.time || task.scheduledTime || ''
      initial.days = task.scheduledDays || []
    } else if (task.type === 'water') {
      initial.target = meta.target || '2L'
      initial.days = task.scheduledDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    } else if (task.type === 'sleep') {
      initial.bedtime = meta.bedtime || ''
      initial.wakeTime = meta.wakeTime || ''
      initial.days = task.scheduledDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    } else if (task.type === 'custom') {
      initial.name = task.name
      initial.time = meta.time || task.scheduledTime || ''
      initial.days = task.scheduledDays || []
    } else if (task.type === 'cardio') {
      initial.time = meta.time || task.scheduledTime || ''
      initial.goal = meta.goal || ''
      initial.duration = meta.duration || ''
      initial.days = task.scheduledDays || []
    } else if (task.type === 'steps') {
      initial.days = task.scheduledDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }

    setFormData(initial)
    setStep(1)
  }

  // Extract subject from task name (e.g., "Study — BCA Algorithms" -> "BCA Algorithms")
  const extractSubject = (name: string): string => {
    const match = name.match(/Study\s*—\s*(.+)/)
    return match ? match[1] : ''
  }

  const handleSaveChanges = async () => {
    if (!task || !user || saving) return

    setSaving(true)

    try {
      // Build updated task object
      const updates: Partial<Task> = {}

      // For study tasks, reconstruct name from subject
      if (task.type === 'study' && formData.subject) {
        updates.name = `Study — ${formData.subject}`
      } else if (formData.name && formData.name !== task.name) {
        updates.name = formData.name
      }

      // Scheduled days
      if (formData.days && JSON.stringify(formData.days) !== JSON.stringify(task.scheduledDays)) {
        updates.scheduledDays = formData.days
      }

      // Build meta object
      const meta: Record<string, any> = {}
      let hasMetaChanges = false

      if (task.type === 'gym') {
        if (formData.time !== undefined) {
          meta.time = formData.time
          hasMetaChanges = true
        }
        if (formData.goal !== undefined) {
          meta.goal = formData.goal
          hasMetaChanges = true
        }
        updates.scheduledTime = formData.time || ''
      } else if (task.type === 'study') {
        if (formData.duration !== undefined) {
          meta.duration = formData.duration
          hasMetaChanges = true
        }
        if (formData.time !== undefined) {
          meta.time = formData.time
          hasMetaChanges = true
        }
        updates.scheduledTime = formData.time || ''
      } else if (task.type === 'water') {
        if (formData.target !== undefined) {
          meta.target = formData.target
          hasMetaChanges = true
        }
      } else if (task.type === 'sleep') {
        if (formData.bedtime !== undefined) {
          meta.bedtime = formData.bedtime
          hasMetaChanges = true
        }
        if (formData.wakeTime !== undefined) {
          meta.wakeTime = formData.wakeTime
          hasMetaChanges = true
        }
        updates.scheduledTime = formData.bedtime || ''
      } else if (task.type === 'custom') {
        if (formData.time !== undefined) {
          meta.time = formData.time
          hasMetaChanges = true
        }
        updates.scheduledTime = formData.time || ''
      } else if (task.type === 'cardio') {
        if (formData.time !== undefined) {
          meta.time = formData.time
          hasMetaChanges = true
        }
        if (formData.goal !== undefined) {
          meta.goal = formData.goal
          hasMetaChanges = true
        }
        if (formData.duration !== undefined) {
          meta.duration = formData.duration
          hasMetaChanges = true
        }
        updates.scheduledTime = formData.time || ''
      }

      if (hasMetaChanges) {
        updates.meta = meta
      }

      // Only update if there are changes
      if (Object.keys(updates).length === 0) {
        onToast('No changes made', 'error')
        setSaving(false)
        return
      }

      const success = await updateTask(task.id, updates, user.id)
      setSaving(false)

      if (success) {
        onToast('Habit updated successfully', 'success')
        handleClose()
      } else {
        onToast('Failed to update habit', 'error')
      }
    } catch (err) {
      setSaving(false)
      onToast('Error updating habit', 'error')
      if (import.meta.env.DEV) {
        console.error('Error updating habit:', err)
      }
    }
  }

  const handleClose = () => {
    onClose()
    // Reset after animation
    setTimeout(() => {
      setStep(1)
      setFormData({})
    }, 350)
  }

  if (!open || !task) return null

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
            {step === 1 && 'Edit Habit'}
            {step === 2 && 'Edit Details'}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-1 py-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 rounded-full transition-all duration-200',
                s <= step ? 'bg-accent-lime' : 'bg-bg-border'
              )}
              style={{
                width: s === step ? '20px' : '6px',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-6">
          {/* Step 1: Task Type Review */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-bg-card border border-bg-border rounded-2xl p-6 flex flex-col items-center gap-4">
                <div>{TYPE_ICONS[task.type]}</div>
                <div className="text-center">
                  <p className="text-sm text-text-secondary">Habit type</p>
                  <p className="font-semibold text-text-primary">{TYPE_NAMES[task.type]}</p>
                </div>
              </div>

              <div className="bg-bg-card border border-bg-border rounded-2xl p-4">
                <p className="text-xs text-text-secondary mb-1">Current name</p>
                <p className="text-text-primary font-medium">{task.name}</p>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  handleOpen()
                  setStep(2)
                }}
              >
                Edit Details →
              </Button>
            </div>
          )}

          {/* Step 2: Edit Form */}
          {step === 2 && (
            <div className="space-y-6">
              {task.type === 'gym' && (
                <GymQuestions formData={formData} setFormData={setFormData} />
              )}
              {task.type === 'study' && (
                <StudyQuestions formData={formData} setFormData={setFormData} />
              )}
              {task.type === 'water' && (
                <WaterQuestions formData={formData} setFormData={setFormData} />
              )}
              {task.type === 'sleep' && (
                <SleepQuestions formData={formData} setFormData={setFormData} />
              )}
              {task.type === 'custom' && (
                <CustomQuestions formData={formData} setFormData={setFormData} />
              )}
              {task.type === 'cardio' && (
                <CustomQuestions formData={formData} setFormData={setFormData} />
              )}
              {task.type === 'steps' && (
                <StepsQuestions formData={formData} setFormData={setFormData} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={saving}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  isLoading={saving}
                  disabled={saving}
                  onClick={() => void handleSaveChanges()}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
