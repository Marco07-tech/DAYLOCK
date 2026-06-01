interface ProgressBarProps {
  percent: number;
  completed?: number;
  total?: number;
}

export function ProgressBar({ percent, completed, total }: ProgressBarProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const showStats = completed !== undefined && total !== undefined && total > 0;

  return (
    <div className="mb-5">
      <div className="h-1 bg-bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-lime rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        {showStats && (
          <p className="text-xs text-text-secondary">
            <span className="text-accent-lime font-semibold">{completed}</span> of{' '}
            <span className="text-accent-lime font-semibold">{total}</span> habits completed
          </p>
        )}
        {clampedPercent > 0 && (
          <p className="text-right text-xs text-text-secondary ml-auto">
            {clampedPercent}% complete
          </p>
        )}
      </div>
    </div>
  );
}
