import { cn } from '../../../lib/utils';

const TARGETS = ['2L', '2.5L', '3L', '4L'];
const TARGET_PERCENT = { '2L': 50, '2.5L': 62.5, '3L': 75, '4L': 100 };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface WaterQuestionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export function WaterQuestions({ formData, setFormData }: WaterQuestionsProps) {
  const selectedTarget = formData.target || '2L';
  const selectedDays = formData.days || [];
  const fillPercent = TARGET_PERCENT[selectedTarget as keyof typeof TARGET_PERCENT] || 50;

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d: string) => d !== day)
      : [...selectedDays, day];
    setFormData({ ...formData, days: newDays });
  };

  return (
    <div className="space-y-6">
      {/* Question 1: Daily target */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Daily target
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TARGETS.map((target) => (
            <button
              key={target}
              onClick={() => setFormData({ ...formData, target })}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                selectedTarget === target
                  ? 'bg-accent-lime text-black'
                  : 'bg-bg-card border border-bg-border text-text-primary hover:border-accent-lime'
              )}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      {/* Glass visual */}
      <div className="flex justify-center">
        <div className="relative w-20 h-40 border-4 border-accent-lime rounded-b-3xl rounded-t-lg overflow-hidden bg-bg-card">
          {/* Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent-lime to-accent-lime transition-all duration-300"
            style={{
              height: `${fillPercent}%`,
              opacity: 0.27,
            }}
          />
          {/* Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-accent-lime">{selectedTarget}</span>
          </div>
        </div>
      </div>

      {/* Question 2: Repeat on */}
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
