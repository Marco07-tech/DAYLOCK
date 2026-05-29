interface ProgressBarProps {
  percent: number;
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="mb-5">
      <div className="h-1 bg-bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-lime rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {clampedPercent > 0 && (
        <p className="text-right text-xs text-text-secondary mt-1">
          {clampedPercent}% complete
        </p>
      )}
    </div>
  );
}
