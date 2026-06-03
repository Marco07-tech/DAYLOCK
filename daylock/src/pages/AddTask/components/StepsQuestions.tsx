import { cn } from '../../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface StepsQuestionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export function StepsQuestions({ formData, setFormData }: StepsQuestionsProps) {
  const selectedDays = formData.days || [];

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d: string) => d !== day)
      : [...selectedDays, day];
    setFormData({ ...formData, days: newDays });
  };

  return (
    <div className="space-y-4">
      <p className="text-text-primary text-sm">Name: <span className="text-accent-lime font-semibold">10,000 steps today</span></p>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Scheduled days
        </label>
        <div className="flex gap-2 justify-between">
          {DAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                'w-8 h-8 rounded-full text-xs font-medium transition-all duration-150 flex items-center justify-center',
                selectedDays.includes(day)
                  ? 'bg-accent-lime border border-accent-lime text-black'
                  : 'bg-bg-card border border-bg-border text-text-primary'
              )}
            >
              {DAY_INITIALS[idx]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
