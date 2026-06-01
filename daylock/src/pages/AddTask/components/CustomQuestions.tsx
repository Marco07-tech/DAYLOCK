import { cn, formatTo24Hour, formatTo12Hour } from '../../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface CustomQuestionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export function CustomQuestions({ formData, setFormData }: CustomQuestionsProps) {
  const selectedDays = formData.days || [];

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d: string) => d !== day)
      : [...selectedDays, day];
    setFormData({ ...formData, days: newDays });
  };

  return (
    <div className="space-y-6">
      {/* Question 1: Task name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Task name
        </label>
        <input
          type="text"
          placeholder="e.g. Read book, Meditate..."
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>

      {/* Question 2: Reminder time (optional) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Reminder time (optional)
        </label>
        <input
          type="time"
          value={formatTo24Hour(formData.time || '')}
          onChange={(e) => setFormData({ ...formData, time: formatTo12Hour(e.target.value) })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>

      {/* Question 3: Repeat on */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Repeat on
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
