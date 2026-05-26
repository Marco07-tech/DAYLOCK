import { useRef, useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [filled, setFilled] = useState<boolean[]>(new Array(length).fill(false));

  useEffect(() => {
    setFilled(value.split('').map((_, i) => i < value.length));
  }, [value, length]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;

    const newValue = value.split('');
    newValue[index] = char;
    const updated = newValue.join('').slice(0, length);
    onChange(updated);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.length === length) {
      onComplete?.(updated);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChange(newValue);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold',
              'bg-surface border-2 rounded-lg',
              'focus:outline-none transition-all duration-200',
              filled[index]
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-foreground',
              error && 'border-red-500 bg-red-500/10',
              'focus:border-primary focus:ring-1 focus:ring-primary/50'
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-xs text-red-500">Invalid verification code</p>
      )}
    </div>
  );
}
