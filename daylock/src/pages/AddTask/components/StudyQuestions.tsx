import { cn } from '../../../lib/utils';

const DURATIONS = ['30 min', '1 hour', '2 hours', '3 hours+'];

interface StudyQuestionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export function StudyQuestions({ formData, setFormData }: StudyQuestionsProps) {
  const selectedDuration = formData.duration || null;

  return (
    <div className="space-y-6">
      {/* Question 1: Subject / Topic */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Subject / Topic
        </label>
        <input
          type="text"
          placeholder="e.g. BCA — Operating Systems"
          value={formData.subject || ''}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>

      {/* Question 2: Daily target */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Daily target
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DURATIONS.map((duration) => (
            <button
              key={duration}
              onClick={() => setFormData({ ...formData, duration })}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                selectedDuration === duration
                  ? 'bg-accent-lime text-black'
                  : 'bg-bg-card border border-bg-border text-text-primary hover:border-accent-lime'
              )}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      {/* Question 3: Preferred time */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Preferred time
        </label>
        <input
          type="text"
          placeholder="e.g. 10:00 AM"
          value={formData.time || ''}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-lime transition-colors"
        />
      </div>
    </div>
  );
}
