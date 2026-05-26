import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function FormInput({
  label,
  error,
  icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={cn(
            'w-full px-4 py-2.5 bg-surface border border-border rounded-lg',
            'text-foreground placeholder:text-muted',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50',
            'transition-colors duration-200',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
            className
          )}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
