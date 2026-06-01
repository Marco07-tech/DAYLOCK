import { cn, formatTo24Hour, formatTo12Hour } from '../../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface SleepQuestionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

function parseTime(timeStr: string): number | null {
  if (!timeStr) return null;
  
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function calculateSleepHours(bedtime: string, wakeTime: string): string | null {
  const bedMinutes = parseTime(bedtime);
  const wakeMinutes = parseTime(wakeTime);

  if (bedMinutes === null || wakeMinutes === null) return null;

  let diff = wakeMinutes - bedMinutes;
  if (diff < 0) diff += 24 * 60; // Next day

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (minutes === 0) return `${hours} hrs`;
  return `${hours}h ${minutes}m`;
}

export function SleepQuestions({ formData, setFormData }: SleepQuestionsProps) {
  const bedtime = formData.bedtime || '';
  const wakeTime = formData.wakeTime || '';
  const sleepDuration = calculateSleepHours(bedtime, wakeTime);
  const selectedDays = formData.days || [];

  const bedMinutes = parseTime(bedtime);
  const wakeMinutes = parseTime(wakeTime);
  let sleepHours = 0;
  if (bedMinutes !== null && wakeMinutes !== null) {
    let diff = wakeMinutes - bedMinutes;
    if (diff < 0) diff += 24 * 60;
    sleepHours = diff / 60;
  }

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d: string) => d !== day)
      : [...selectedDays, day];
    setFormData({ ...formData, days: newDays });
  };

  return (
    <div className="space-y-6">
      {/* Question 1: Bedtime */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Bedtime
        </label>
        <input
          type="time"
          value={formatTo24Hour(bedtime)}
          onChange={(e) => setFormData({ ...formData, bedtime: formatTo12Hour(e.target.value) })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>

      {/* Question 2: Wake up time */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Wake up time
        </label>
        <input
          type="time"
          value={formatTo24Hour(wakeTime)}
          onChange={(e) => setFormData({ ...formData, wakeTime: formatTo12Hour(e.target.value) })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>

      {/* Sleep duration display */}
      {sleepDuration && (
        <div className="bg-bg-card border border-accent-lime rounded-lg p-3">
          <p className="text-text-primary text-sm">
            Sleep duration: <span className="text-accent-lime font-semibold">{sleepDuration}</span>
          </p>
          {sleepHours >= 7 ? (
            <p className="text-accent-lime text-xs mt-1">✓ Great sleep target!</p>
          ) : (
            <p className="text-status-warning text-xs mt-1">⚠ Try to get 7+ hours</p>
          )}
        </div>
      )}

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
