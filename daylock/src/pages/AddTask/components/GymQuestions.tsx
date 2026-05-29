import { cn } from '../../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const GOALS = ['Cut 🔥', 'Bulk 💪', 'Maintain ⚖️'];

interface GymQuestionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export function GymQuestions({ formData, setFormData }: GymQuestionsProps) {
  const selectedDays = formData.days || [];
  const selectedGoal = formData.goal || null;

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d: string) => d !== day)
      : [...selectedDays, day];
    setFormData({ ...formData, days: newDays });
  };

  return (
    <div className="space-y-6">
      {/* Question 1: Gym days */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Gym ke din select karo
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

      {/* Question 2: Preferred time */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Preferred time
        </label>
        <input
          type="text"
          placeholder="e.g. 6:00 PM"
          value={formData.time || ''}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>

      {/* Question 3: Current goal */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Current goal
        </label>
        <div className="flex gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => setFormData({ ...formData, goal })}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                selectedGoal === goal
                  ? 'bg-accent-lime text-black'
                  : 'bg-bg-card border border-bg-border text-text-primary hover:border-accent-lime'
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
